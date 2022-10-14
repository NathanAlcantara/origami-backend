import { User } from "@entities/user";
import { CacheKey, getCache } from "redisUtils";

/**
 * Função de validação das brechas de tipagem
 */
const validGapOfTSTypes = (value: any): boolean => {
  switch (value) {
    case null:
    case "null":
    case undefined:
    case "undefined":
      return false;
    default:
      return true;
  }
};

/**
 * Realiza uma validação geral sobre a existência de um valor
 *
 * @example
 * // returns true
 * 	isValid({...})
 * 	isValid([...])
 * 	isValid("something")
 * 	isValid(true)
 * 	isValid(new Date())
 * 	isValid(function() {})
 * 	isValid(() => {})
 *
 * // returns false
 * 	isValid({})
 * 	isValid([])
 * 	isValid("")
 * 	isValid(" ")
 * 	isValid(false)
 * 	isValid(null)
 * 	isValid(undefined)
 * 	isValid("null")
 * 	isValid("undefined")
 */
export const isValid = (value: any): boolean => {
  if (validGapOfTSTypes(value)) {
    const typeValue = typeof value;
    switch (typeValue) {
      case "object":
        if (Object.prototype.toString.call(value) === "[object Date]") {
          return true;
        }
        return Boolean(Object.entries(value).length);
      case "string":
        return Boolean(value.trim());
      case "number":
        return !isNaN(value);
      case "undefined":
        return false;
      default:
        return true;
    }
  } else {
    return false;
  }
};

/**
 * Realiza uma validação geral sobre a falta da existência de um valor
 *
 * @example
 * // returns true
 * 	isNotValid({})
 * 	isNotValid([])
 * 	isNotValid("")
 * 	isNotValid(" ")
 * 	isNotValid(false)
 * 	isNotValid(null)
 * 	isNotValid(undefined)
 * 	isNotValid("null")
 * 	isNotValid("undefined")
 *
 * // returns false
 * 	isNotValid({...})
 * 	isNotValid([...])
 * 	isNotValid("something")
 * 	isNotValid(true)
 * 	isNotValid(new Date())
 * 	isNotValid(function() {})
 * 	isNotValid(() => {})
 */
export const isNotValid = (value: any): boolean => {
  return !isValid(value);
};

export type TConstructor<T = {}> = new (...args: any[]) => T;

export const getLoggedUser = () => {
  return getCache<User>(CacheKey.LOGGED_USER);
};
