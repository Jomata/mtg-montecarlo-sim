import { CompareType, GroupType, TestType } from "./enums";

export type ClickHandler = (ev: React.MouseEvent<HTMLAnchorElement>) => void;

export type Action =
  | { type: "changeGroupType", testId: number, groupType: GroupType }
  | { type: "changeSingleType", testId: number, compareType: CompareType }

export type State = { test: number }

export interface DragItem {
    id: number
    type:string
    testType: TestType
    parentId?:number
  }