export class ValidationService {
  // #region Number Validations
  
  /**
   * Validates that a value is a whole number (integer)
   * @param value The value to validate
   * @param fieldName The name of the field for error messages
   * @throws Error if value is not a whole number
   */
  public static throwIfNotWholeNumber(value: number, fieldName: string): void {
    if (isNaN(value) || !Number.isInteger(value)) {
      throw new Error(`${fieldName} must be a whole number`);
    }
  }

  /**
   * Validates that a value is a positive number (greater than 0)
   * @param value The value to validate
   * @param fieldName The name of the field for error messages
   * @throws Error if value is not positive
   */
  public static throwIfNotPositiveNumber(value: number, fieldName: string): void {
    if (value < 0 || value >= Infinity) {
      throw new Error(`${fieldName} must be a positive number`);
    }
  }

  /**
   * Validates that a value meets a minimum threshold
   * @param value The value to validate
   * @param min The minimum allowed value
   * @param fieldName The name of the field for error messages
   * @throws Error if value is below minimum
   */
  public static throwIfBelowMinimum(value: number, min: number, fieldName: string): void {
    if (value < min) {
      throw new Error(`${fieldName} must be at least ${min}`);
    }
  }

  // #endregion

  // #region Enum/Array Validations

  /**
   * Validates that a value exists in an array of valid options
   * @param value The value to validate
   * @param validValues Array of valid values
   * @param fieldName The name of the field for error messages
   * @throws Error if value is not in the valid options
   */
  public static throwIfInvalidEnum<T extends string | number>(value: T, validValues: T[], fieldName: string): void {
    if (!validValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${validValues.join(', ')}`);
    }
  }

  // #endregion

  // #region Complex Validations

  /**
   * Validates min/max range relationship
   * @param min The minimum value
   * @param max The maximum value
   * @param minFieldName The name of the min field for error messages
   * @param maxFieldName The name of the max field for error messages
   * @throws Error if min is not less than max
   */
  public static throwIfInvalidMinMaxRange(
    min: number, 
    max: number, 
    minFieldName: string = 'min value', 
    maxFieldName: string = 'max value'
  ): void {
    if (min >= max) {
      throw new Error(`${minFieldName} must be less than ${maxFieldName}`);
    }
  }

  // #endregion

  // #region Validation Chains (Common Combinations)

  /**
   * Validates that a number is a whole, positive number
   * @param value The value to validate
   * @param fieldName The name of the field for error messages
   * @throws Error if validation fails
   */
  public static validateWholePositiveNumber(value: number, fieldName: string): void {
    this.throwIfNotWholeNumber(value, fieldName);
    this.throwIfNotPositiveNumber(value, fieldName);
  }

  /**
   * Validates that a number is whole, positive, and meets minimum value
   * @param value The value to validate
   * @param min The minimum allowed value
   * @param fieldName The name of the field for error messages
   * @throws Error if validation fails
   */
  public static validateWholePositiveWithMin(value: number, min: number, fieldName: string): void {
    this.throwIfNotWholeNumber(value, fieldName);
    this.throwIfNotPositiveNumber(value, fieldName);
    this.throwIfBelowMinimum(value, min, fieldName);
  }
  // #endregion
}