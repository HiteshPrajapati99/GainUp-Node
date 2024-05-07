export async function parseNestedJSON(array) {
  return new Promise((resolve, reject) => {
    // Helper function to parse stringified JSON
    function parseJSONString(obj) {
      for (let prop in obj) {
        if (typeof obj[prop] === "string") {
          try {
            obj[prop] = JSON.parse(obj[prop]);
          } catch (error) {
            // If the property is not valid JSON, leave it unchanged
          }
        } else if (typeof obj[prop] === "object") {
          parseJSONString(obj[prop]); // Recursively parse nested objects
        }
      }
    }

    array.forEach((obj) => {
      parseJSONString(obj);
    });

    resolve(array);
  });
}
