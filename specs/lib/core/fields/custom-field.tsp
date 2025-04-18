namespace CommonGrants.Fields;

// ########################################
// Field types definition
// ########################################

/** The set of JSON schema types supported by a custom field */
enum CustomFieldType {
  string,
  number,
  boolean,
  object,
  array,
}

// ########################################
// Model definition
// ########################################

/** Model for defining custom fields that are specific to a given implementation.
 *
 * @example How to define a custom field using this model
 *
 * ```typespec
 * model Agency extends CustomField {
 *   name: "agency";
 *
 *   type: CustomFieldType.string;
 *
 *   @example("Department of Transportation")
 *   value: string;
 *
 *   description?: "The agency responsible for managing this opportunity";
 * }
 * ```
 */
@example(
  Examples.CustomField.programArea,
  #{ title: "String field for program area" }
)
@example(
  Examples.CustomField.eligibilityTypes,
  #{ title: "Array field for eligibility types" }
)
@doc("A custom field on a model") // Overrides internal docstrings when emitting OpenAPI
model CustomField {
  /** Name of the custom field */
  name: string;

  /** The JSON schema type to use when de-serializing the `value` field */
  type: CustomFieldType;

  /** Link to the full JSON schema for this custom field */
  schema?: url;

  /** Value of the custom field */
  value: unknown;

  /** Description of the custom field's purpose */
  description?: string;
}

// ########################################
// Model examples
// ########################################

/** Examples of the CustomField model */
namespace Examples.CustomField {
  /** An example of a string custom field */
  const programArea = #{
    name: "programArea",
    type: CustomFieldType.string,
    value: "Healthcare Innovation",
    description: "Primary focus area of the grant program",
    schema: "https://example.com/program-areas.json",
  };

  /** An example of an array custom field */
  const eligibilityTypes = #{
    name: "eligibilityType",
    type: CustomFieldType.array,
    value: #["nonprofit", "academic"],
    description: "Types of eligible organizations",
  };
}
