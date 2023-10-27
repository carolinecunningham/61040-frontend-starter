import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Feed, Filtering, Friend, Label, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string, school: string, hometown: string) {
    WebSession.isLoggedOut(session);
    const user = (await User.create(username, password, school, hometown)).user;
    if (user !== null) {
      const userId = (await User.getUserById(user._id))._id;
      await Feed.createFeed(userId);
      // add users to internal lists for school and hometown
      await Filtering.assignToFilter(school, userId);
      await Filtering.assignToFilter(hometown, userId);
    }
    return user;
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    // TODO: why does this not get called
    const user = WebSession.getUser(session);
    if (update.school) {
      const usr = await User.getUserById(user);
      const userId = usr._id;
      // add users to internal lists for school
      await Filtering.assignToFilter(update.school, userId);
      await Filtering.removeFromFilter(usr.school, userId);
    }
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  // POST ROUTES

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, prompt: number, audienceLabel?: ObjectId, options?: PostOptions) {
    const user = WebSession.getUser(session);
    await Post.isPromptSuppported(prompt);
    if (audienceLabel) {
      await Label.isAuthor(audienceLabel, user);
    }
    console.log(audienceLabel);
    const created = await Post.create(user, content, prompt, audienceLabel, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    if (update.audience) {
      await Label.isAuthor(update.audience, user);
    }
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/posts/prompt/:_id")
  async getPostPrompt(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const username = (await User.getUserById(user)).username;
    return await Post.getPostPrompt(username, _id);
  }

  // FRIEND ROUTES
  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.get("/friends/objects")
  async getFriendsObs(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const friends = await Friend.getFriends(user);
    const usernames = await User.idsToUsernames(friends);
    const result: Record<string, ObjectId> = {};
    friends.forEach((friend, index) => {
      result[usernames[index]] = friend;
    });
    return result;
  }

  @Router.get("/friends/ids")
  async getFriendsIds(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Friend.getFriends(user);
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    // TODO: why does this not work -- generates user not found error
    console.log("FRIEND");
    console.log(friend);
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friends/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    const results = await Friend.getRequests(user);
    const pendingResults = results.filter((req) => req.status !== "accepted");
    return await Responses.friendRequests(pendingResults);
  }

  @Router.post("/friends/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friends/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friends/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friends/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  // LABEL ROUTES
  // Routes are called "lists" because known to users' as MyLifeLists

  @Router.get("/lists/")
  async getLabels(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    console.log(user);
    console.log(await Label.getLabelsByAuthor(user));
    return await Label.getLabelsByAuthor(user);
  }

  @Router.post("/lists")
  async createLabel(session: WebSessionDoc, name: string) {
    const user = WebSession.getUser(session);
    return await Label.createLabel(user, name);
  }

  @Router.put("/lists/assign/:_id")
  async assignToLabel(session: WebSessionDoc, _id: ObjectId, friendName: string) {
    const user = WebSession.getUser(session);
    const friendUser = await User.getUserByUsername(friendName);
    const friendUserID = friendUser._id;
    await Label.isAuthor(_id, user);
    await Friend.areUsersFriends(friendUserID, user);
    await Label.itemNotInLabel(_id, friendUserID);
    return await Label.assignToLabel(_id, friendUserID);
  }

  @Router.put("/lists/remove/:_id")
  async removeFromLabel(session: WebSessionDoc, _id: ObjectId, friendName: string) {
    const user = WebSession.getUser(session);
    const friendUser = await User.getUserByUsername(friendName);
    const friendUserID = friendUser._id;
    await Label.isAuthor(_id, user);
    return await Label.removeFromLabel(_id, friendUserID);
  }

  @Router.delete("/lists/:_id")
  async deleteLabel(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Label.isAuthor(_id, user);
    return await Label.deleteLabel(_id);
  }

  @Router.get("/lists/:_id")
  async getLabelItems(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Label.isAuthor(_id, user);
    return await Label.getLabelItems(_id);
  }

  @Router.get("/lists/usernames/:_id")
  async getLabelUsernames(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Label.isAuthor(_id, user);
    const items = await Label.getLabelItems(_id);
    return await Promise.all(items.map(async (obj_id) => (await User.getUserById(obj_id)).username));
  }

  // FEED Routes

  @Router.get("/feed/")
  async generateFeed(session: WebSessionDoc, label?: ObjectId) {
    // referenced https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
    const user = WebSession.getUser(session);
    await Feed.clearFeed(user);

    let labelItems: ObjectId[] = [];
    if (label) {
      // filter posts by authors only in label
      await Label.isAuthor(label, user);
      labelItems = await Label.getLabelItems(label);
      labelItems = await Promise.all(labelItems.map(async (user_id) => (await User.getUserById(user_id))._id));
    }

    const filterIter = label ? labelItems : await Friend.getFriends(user);

    for (const filterUser of filterIter) {
      // add post IDs to Feed
      const posts = await Post.getByAuthor(filterUser);

      // referenced https://web.mit.edu/6.102/www/sp23/classes/13-functional/
      const postsWithAudience = posts.filter((post) => post.audience !== undefined);
      const postsWithoutAudience = posts.filter((post) => post.audience === undefined);
      await Feed.bulkAddToFeed(user, postsWithoutAudience);

      for (const post of postsWithAudience) {
        // console.log("REACHED");
        if (post.audience) {
          // get label items in audience
          const labelItems = await Label.getLabelItems(post.audience);
          const labelItemsStr = labelItems.map((user_id) => user_id.toString());
          if (labelItemsStr.indexOf(user.toString()) !== -1) {
            // user in specified audience to see post
            await Feed.addToFeed(user, post);
          }
        } else {
          await Feed.addToFeed(user, post);
        }
      }
    }

    return await Responses.posts(await Feed.getFeedItems(user));
  }

  // FILTER ROUTES

  @Router.get("/filter/recommendedUsers/")
  async getAllRecommendedUsers(session: WebSessionDoc) {
    const userID = WebSession.getUser(session);
    const user = await User.getUserById(userID);

    // referenced https://www.geeksforgeeks.org/how-to-get-the-union-of-two-sets-in-javascript/

    let usersShareSchool = await Filtering.getFilterItems(user.school);
    let usersShareHometown = await Filtering.getFilterItems(user.hometown);

    // remove original user and friends from potential recommendees

    const friends = await Friend.getFriends(userID);
    usersShareSchool = Filtering.removeItemsFromFilter(usersShareSchool, friends.concat([userID]));
    usersShareHometown = Filtering.removeItemsFromFilter(usersShareHometown, friends.concat([userID]));

    // combine recommended users, prioritize by both school and hometown

    const recItems = await Filtering.getRecommendedItems(userID, usersShareSchool, usersShareHometown);
    const recUsernames = await Responses.recommendedUsers(recItems);

    const recResults: Record<string, string> = {};

    for (let i = 0; i < recUsernames.length; i++) {
      const recReason = Filtering.getRecReason(userID, usersShareSchool, usersShareHometown);
      if (recReason == 2) {
        recResults[recUsernames[i]] = "Also goes to " + user.school + " and is from " + user.hometown;
      } else if (recReason == 1) {
        recResults[recUsernames[i]] = "Also goes to " + user.school;
      } else {
        recResults[recUsernames[i]] = "Also is from " + user.hometown;
      }
    }
    return recResults;
  }

  @Router.put("/filter/recommendedUsers/")
  async getRecommendationRange(session: WebSessionDoc, startingIndex: number, numDisplay: number) {
    const userID = WebSession.getUser(session);
    const user = await User.getUserById(userID);

    const recItems = await Filtering.updateShown(userID, startingIndex, numDisplay);
    const recUsernames = await Responses.recommendedUsers(recItems);
    const recUsers = await Promise.all(recItems.map(async (obj_id) => await User.getUserById(obj_id)));

    const recResults: Record<string, string> = {};

    for (let i = 0; i < recUsers.length; i++) {
      if (recUsers[i].school === user.school && recUsers[i].hometown === user.hometown) {
        recResults[recUsernames[i]] = "Also goes to " + user.school + " and is from " + user.hometown;
      } else if (recUsers[i].school === user.school) {
        recResults[recUsernames[i]] = "Also goes to " + user.school;
      } else {
        recResults[recUsernames[i]] = "Also is from " + user.hometown;
      }
    }
    return recResults;
  }

  // @Router.put("/filter/recommendedUsers/")
  // async seeMoreSuggestions(session: WebSessionDoc) {
  //   const userID = WebSession.getUser(session);
  //   const user = await User.getUserById(userID);

  //   const recItems = await Filtering.getMoreRecommendations(userID);
  //   const recUsers = await Promise.all(recItems.map(async (obj_id) => await User.getUserById(obj_id)));
  //   const recUsernames = await Responses.recommendedUsers(recItems);

  //   const recResults: Record<string, string> = {};

  //   for (let i = 0; i < recItems.length; i++) {
  //     if (recUsers[i].school === user.school && recUsers[i].hometown === user.hometown) {
  //       recResults[recUsernames[i]] = "Also goes to " + user.school + " and is from " + user.hometown;
  //     } else if (recUsers[i].school === user.school) {
  //       recResults[recUsernames[i]] = "Also goes to " + user.school;
  //     } else {
  //       recResults[recUsernames[i]] = "Also is from " + user.hometown;
  //     }
  //   }
  //   return recResults;
  // }
}

export default getExpressRouter(new Routes());
