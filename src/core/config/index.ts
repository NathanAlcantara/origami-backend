import envs from "envs";

export const initializeEnvs = () => {
  const errorMessages = Object.entries(envs).reduce((arr, entry) => {
    if (typeof entry[1] !== "boolean" && !entry[1]) {
      arr.push(entry[0]);
    }
    return arr;
  }, []);

  if (errorMessages.length > 0) {
    console.error(
      "Environment variables not set:\n".concat(errorMessages.join("\n"))
    );
    throw new Error("Set variable environments");
  }
};