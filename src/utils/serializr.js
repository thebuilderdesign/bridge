import * as s from 'serializr';

export function serialize(propSchema, value) {
  const modelSchema = s.createSimpleSchema({ data: propSchema });
  return s.serialize(modelSchema, { data: value }).data;
}

export function deserialize(propSchema, json, callback, customArgs) {
  const modelSchema = s.createSimpleSchema({ data: propSchema });
  return s.deserialize(modelSchema, { data: json }, callback, customArgs).data;
}

const { primitive, raw, date, alias, custom, SKIP, optional } = s;

export { primitive, raw, date, alias, custom, SKIP, optional };

export function model(props, parent, additionalArgs) {
  const modelSchema = {
    factory() {
      return {};
    },
    props,
    extends: parent,
  };
  return s.object(modelSchema, additionalArgs);
}

function makeNullable(propSchema) {
  return {
    ...propSchema,
    serializer(value) {
      if (value == null) {
        return value;
      }
      return propSchema.serializer(value);
    },
    deserializer(jsonValue, done, ...args) {
      if (jsonValue == null) {
        return done(null, jsonValue);
      }
      return propSchema.deserializer(jsonValue, done, ...args);
    },
  };
}

export function list(propSchema, additionalArgs) {
  return makeNullable(s.list(propSchema, additionalArgs));
}

export function map(propSchema, additionalArgs) {
  return makeNullable(s.map(propSchema, additionalArgs));
}
