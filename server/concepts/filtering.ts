import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface FilterDoc extends BaseDoc {
  filterName: string;
  filterItems: ObjectId[];
}

export interface RecItemsDoc extends BaseDoc {
  owner: ObjectId;
  recommendedItems: ObjectId[];
}

// referenced https://howtodoinjava.com/typescript/sets/

export default class FilteringConcept {
  public readonly filters = new DocCollection<FilterDoc>("filters");
  public readonly recommended_items = new DocCollection<RecItemsDoc>("recommended_items");

  private async createFilter(filterName: string, firstItem: ObjectId) {
    // private: filters are only created by the app to enable passive filtering
    const filterItems = [firstItem];
    const _id = await this.filters.createOne({ filterName, filterItems });
    return { msg: "Filter successfully created!", filter: await this.filters.readOne({ _id }) };
  }

  async getFilter(filterName: string) {
    const filter = await this.filters.readOne({ filterName });
    return filter;
  }

  async assignToFilter(filterName: string, item: ObjectId) {
    // we have assignToFilter 1) check if filter already exists and 2) if not create it
    // this simplifies logic of having to check if filter already exists
    const filter = await this.filters.readOne({ filterName });

    if (!filter) {
      // need to create a new filter
      return await this.createFilter(filterName, item);
    } else {
      // assign to existing filter
      const filter_items = filter.filterItems.concat(item);
      await this.filters.updateOne({ filterName }, { filterItems: filter_items });
    }
  }

  async removeFromFilter(filterName: string, item: ObjectId) {
    // we have assignToFilter 1) check if filter already exists and 2) if not create it
    // this simplifies logic of having to check if filter already exists
    const filter = await this.filters.readOne({ filterName });

    if (!filter) {
      throw new FilterNotFoundError(filterName);
    } else {
      // remove from filter
      const filter_idx = filter.filterItems.indexOf(item);
      const filter_items = filter.filterItems;
      console.log(filter_items);
      console.log("DELETE");
      if (filter_idx !== -1) {
        filter_items.splice(filter_idx);
      }
      console.log(filter_items);
      await this.filters.updateOne({ filterName }, { filterItems: filter_items });
    }
  }

  async getFilterItems(filterName: string) {
    const filter = await this.filters.readOne({ filterName });

    if (!filter) {
      // filter does not exist
      throw new FilterNotFoundError(filterName);
    }
    return filter.filterItems;
  }

  removeItemsFromFilter(filterI: ObjectId[], itemsToDelete: ObjectId[]) {
    // do NOT modify filter, as we need to track all items later on
    const itemsToDeleteStr = itemsToDelete.map((i) => i.toString());
    let filterINewItems: ObjectId[] = [];
    for (const f of filterI) {
      const f_str = f.toString();
      const indexOfItem = itemsToDeleteStr.indexOf(f_str);
      if (indexOfItem === -1) {
        filterINewItems = filterINewItems.concat([f]);
      }
    }
    return filterINewItems;
  }

  getFiltersIntersection(filter1: ObjectId[], filter2: ObjectId[]) {
    let mutualItems: ObjectId[] = [];
    const filter2Str = filter2.map((i) => i.toString());

    for (const item of filter1) {
      if (filter2Str.indexOf(item.toString()) !== -1) {
        mutualItems = mutualItems.concat([item]);
      }
    }
    return mutualItems;
  }

  async getRecommendedItems(owner: ObjectId, filter1: ObjectId[], filter2: ObjectId[]) {
    const inBothFilters = this.getFiltersIntersection(filter1, filter2);
    const onlyInFilter1 = this.removeItemsFromFilter(filter1, inBothFilters);
    const onlyInFilter2 = this.removeItemsFromFilter(filter2, inBothFilters);

    let recommendedItems: ObjectId[] = [];
    recommendedItems = recommendedItems.concat(inBothFilters);
    recommendedItems = recommendedItems.concat(onlyInFilter1);
    recommendedItems = recommendedItems.concat(onlyInFilter2);
    // console.log(inBothFilters);
    // console.log(onlyInFilter1);
    // console.log(onlyInFilter2);
    // referenced https://stackoverflow.com/questions/60041413/typescript-number-addition-0-1-returns-01

    const recItems = await this.recommended_items.readOne({ owner });
    if (!recItems) {
      await this.recommended_items.createOne({ owner, recommendedItems });
    } else {
      await this.recommended_items.updateOne({ owner }, { recommendedItems });
    }
    return recommendedItems;
  }

  async updateShown(owner: ObjectId, startingIndex: number, numDisplay: number) {
    const recItems = await this.recommended_items.readOne({ owner });
    if (!recItems) {
      throw new RecommendationsNotFoundError(owner);
    }
    if (startingIndex > recItems.recommendedItems.length) {
      throw new NoMoreSuggestionsError(owner);
    } else {
      const endIdx = new Number(startingIndex).valueOf() + new Number(numDisplay).valueOf();
      const end = endIdx > recItems.recommendedItems.length ? recItems.recommendedItems.length : endIdx;
      return recItems.recommendedItems.slice(startingIndex, end);
    }
  }

  // async getMoreRecommendations(owner: ObjectId, maxQuantity: number) {
  //   const recItemsFilter = await this.recommended_items.readOne({ owner });
  //   if (!recItemsFilter) {
  //     throw new RecommendationsNotFoundError(owner);
  //   } else {
  //     const recommended_items = recItemsFilter.recommendedItems;
  //       const maxQuant = maxQuantity / 1;
  //       const end_idx = (recItemsFilter.startingIndex + maxQuant) / 1;
  //       const rec_items = recommended_items.slice(recItemsFilter.startingIndex, end_idx);
  //       const startingIndex = (recItemsFilter.startingIndex += maxQuant);
  //       await this.recommended_items.updateOne({ owner }, { startingIndex });
  //       return rec_items;
  //   }
  // }

  public getRecReason(user_id: ObjectId, usersShareSchool: ObjectId[], usersShareHometown: ObjectId[]) {
    const usersShareSchoolStr = usersShareSchool.map((item) => item.toString());
    const usersShareHometownStr = usersShareHometown.map((item) => item.toString());

    if (usersShareSchoolStr.indexOf(user_id.toString()) !== -1 && usersShareHometownStr.indexOf(user_id.toString()) !== -1) {
      return 2; // school and hometown
    } else if (usersShareSchoolStr.indexOf(user_id.toString()) !== -1) {
      return 1; // school
    } else {
      return 0; // hometown
    }
  }
}

export class RecommendationsNotFoundError extends NotFoundError {
  constructor(public readonly _id: ObjectId) {
    super("Recommended items for {0} does not exist!", _id);
  }
}

export class FilterNotFoundError extends NotFoundError {
  constructor(public readonly filterName: string) {
    super("Filter {0} does not exist!", filterName);
  }
}

export class NoMoreSuggestionsError extends NotAllowedError {
  constructor(public readonly _id: ObjectId) {
    super("No more recommended users {0}!", _id);
  }
}
