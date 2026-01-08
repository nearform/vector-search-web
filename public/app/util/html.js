import React from "react";
import htm from "htm";

export const html = htm.bind(React.createElement);

export const getElements = (event) => {
  const propNames = Object.getOwnPropertyNames(
    event.currentTarget.elements,
  ).filter(([k]) => !/^[0-9]+$/.test(k.toString()));

  return Object.fromEntries(
    propNames.map((k) => {
      const v = event.currentTarget.elements[k];
      if (v.type === "number") {
        return [k, v.valueAsNumber];
      }
      return [k, v.value.trim()];
    }),
  );
};
