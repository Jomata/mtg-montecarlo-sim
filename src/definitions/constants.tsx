import { RGB } from "../models/RGB";
import React from "react";
import { CompareType, GroupType, MatchType } from "./enums";

export const INITIAL_DRAW: number = 6;
export const TOTAL_RUNS: number = 9999;

export const COLOR_ZERO = new RGB(255, 0, 0)
export const COLOR_HUND = new RGB(0, 255, 0)

export const HandlersContext = React.createContext({
    onChangeTestTurn:(id:number,turn:number) => {},
    onChangeGroupName:(id:number,name:string) => {},
    onChangeGroupType:(id:number,group:GroupType) => {},
    onChangeSingleTarget:(id:number,target:string, match?:MatchType) => {},
    onChangeSingleCompare:(id:number,compare:CompareType) => {},
    onChangeSingleCompareTarget:(id:number,compare:CompareType) => {},
    onChangeSingleAmount:(id:number,amount:number) => {},
    onDragDrop:(draggedTestId:number,droppedOnTestId:number) => {},
    checkCanDrop:(draggedTestId:number,droppedOnTestId:number):boolean => true
  })