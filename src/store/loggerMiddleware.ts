// src/store/loggerMiddleware.ts
import { Middleware } from "@reduxjs/toolkit";
import logger from "../services/logging";

type AnyState = any; 

const reduxLoggerMiddleware: Middleware<{}, AnyState> = storeAPI => next => action => {
  logger.debug("Redux Action Dispatched:", action as any);
  logger.debug("Redux State Before:", storeAPI.getState());

  const result = next(action);

  logger.debug("Redux State After:", storeAPI.getState());
  return result;
};

export default reduxLoggerMiddleware;