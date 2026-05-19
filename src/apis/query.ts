import { HttpMethod, options } from "@/apis/types";

const CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY = "care_access_token";
const CARE_PATIENT_TOKEN_LOCAL_STORAGE_KEY = "care_patient_token";

const getAccessToken = (): string | null => {
  const token = localStorage.getItem(CARE_ACCESS_TOKEN_LOCAL_STORAGE_KEY);

  if (token !== null) {
    return token;
  }

  const patientToken = localStorage.getItem(
    CARE_PATIENT_TOKEN_LOCAL_STORAGE_KEY,
  );
  if (patientToken !== null) {
    const parsed = JSON.parse(patientToken);
    return parsed.token;
  }

  return null;
};

export const request = async <T>(
  endpoint: string,
  method: HttpMethod = HttpMethod.GET,
  data: any = {},
  options: options = {},
): Promise<T> => {
  const CARE_BASE_URL = window.CARE_API_URL;

  const { formdata, external, headers, auth: isAuth } = options;

  let url = external ? endpoint : CARE_BASE_URL + endpoint;
  let payload: null | string = formdata ? data : JSON.stringify(data);

  if (method === HttpMethod.GET) {
    const requestParams = data
      ? `?${Object.keys(data)
          .filter((key) => data[key] !== null && data[key] !== undefined)
          .map((key) => `${key}=${data[key]}`)
          .join("&")}`
      : "";
    url += requestParams;
    payload = null;
  }

  const localToken = getAccessToken();

  const auth =
    isAuth === false || typeof localToken === "undefined" || localToken === null
      ? ""
      : "Bearer " + localToken;

  const response = await fetch(url, {
    method: method,
    headers: external
      ? { ...headers }
      : {
          Accept: "application/json",
          ...(formdata ? {} : { "Content-Type": "application/json" }),
          Authorization: auth,
          ...headers,
        },
    body: payload,
  });
  try {
    const txt = await response.clone().text();
    if (txt === "") {
      return {} as any;
    }
    const json = await response.clone().json();
    if (json && response.ok) {
      return json;
    } else {
      throw json;
    }
  } catch (error) {
    throw { error };
  }
};
