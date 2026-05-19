import fileDownload from "js-file-download";
import axios from "axios";
//const base_url = "http://85.31.236.214/gestionapp";
//const base_url = target_store === 1 ? "http://85.31.236.214/gestionapp" : "http://85.31.236.214:8080/gestionapp";
const base_url = "http://127.0.0.1:8000";
const api = base_url + "/api/";

//var fileDownload = require('js-file-download');
//var axios = require('axios')

function set_header(token = null) {
  if (token == null) {
    return {
      "Content-Type": "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

export async function get_token(username = null, password = null) {
  let body = {
    username,
    password,
  };

  let headers = set_header();

  let options = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + "token/", options);
    if (preResp.ok) {
      var resp = await preResp.json();
      let access = resp.access;
      let refresh = resp.refresh;
      sessionStorage.setItem("refreshToken", refresh);
      sessionStorage.setItem("accessToken", access);
      resp = await isLogged();
      return resp;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function register(username = null, email = null, password = null) {
  let body = {
    email,
    username,
    password,
  };

  let headers = set_header();

  let options = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + "register/", options);

    if (preResp.ok) {
      let nextresp = await get_token(username, password);
      return nextresp;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function refreshToken() {
  let refresh = sessionStorage.getItem("refreshToken");
  let headers = set_header();
  let options = {
    method: "post",
    body: JSON.stringify({
      refresh,
    }),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + "token/refresh/", options);
    if (preResp.ok) {
      let resp = await preResp.json();
      let access = resp.access;
      sessionStorage.setItem("accessToken", access);
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function set_vidiq_account(url, username = null, password = null) {
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let body = {
    email: username,
    password: password,
  };

  let options = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.json();
      return resp;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        set_vidiq_account(url, username, password);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

function formatUrl(url) {
  return url;
}

export async function postReq(url, body) {
  url = formatUrl(url);
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.json();
      return resp;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        return postReq(url, body);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function patchReq(url, body) {
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.json();
      return resp;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        return patchReq(url, body);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function post_download_file(url, name, body) {
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "post",
    body: JSON.stringify(body),
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.blob();
      fileDownload(resp, name);
      return true;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        post_download_file(url);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function download_file(url, name) {
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "get",
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.blob();
      fileDownload(resp, name);
      return true;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        download_file(url);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function req_body(url, body) {
  url = formatUrl(url);
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "get",
    headers: headers,
    body,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.json();
      return resp;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        return req(url);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function req(url) {
  url = formatUrl(url);
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "get",
    headers: headers,
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      let resp = await preResp.json();
      return resp;
    } else if (preResp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        return req(url);
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function addImage(product = null, files = null) {
  let form_data = new FormData();
  let access = sessionStorage.getItem("accessToken");
  //access =  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjQ4OTc3OTkwLCJqdGkiOiIyY2EyY2NjMjFmMjQ0YjQyYTc3MjgzYjAzZGM2MTdhMSIsInVzZXJfaWQiOjJ9.uGyjMDKwWTMowoBgxNLiDbfijFcwutbKBkLNrXlvnTA"
  let headers = set_header(access, true);
  let body = {
    product,
  };
  //console.log(body);
  let key = "image";
  let endpoint = "upload/";
  for (let i = 0; i < files.length; i++) {
    form_data.append(key, files[i], files[i].name);
  }

  for (let key of Object.keys(body)) {
    form_data.append(key, body[key]);
  }

  let url = api + endpoint;
  try {
    let resp = await axios.post(url, form_data, {
      headers,
    });
    //console.log(resp.status)
    //console.log(resp.data)

    if (resp.status === 201) {
      return true;
    } else if (resp.status === 200 || resp.status === 400) {
      return resp.data;
    } else {
      return false;
    }
  } catch (error) {
    let resp = error.response;
    if (resp && resp.status === 401) {
      let dec = await refreshToken();
      if (dec) {
        return addImage(product, files);
      } else {
        return false;
      }
    } else {
      //console.log("other errors")
      return false;
    }
  }
}

export async function deleteReq(url) {
  let access = sessionStorage.getItem("accessToken");
  let headers = set_header(access);

  let options = {
    method: "delete",
    headers: headers,
    mode: "cors",
  };

  try {
    let preResp = await fetch(api + url, options);
    if (preResp.ok) {
      try {
        let resp = await preResp.json();
        return resp;
      } catch {
        return true;
      }
    } else if (preResp.status === 401) {
      return false;
    } else {
      return false;
    }
  } catch {
    return false;
  }
}

export async function isLogged() {
  let resp = await req("session");
  return resp;
}

export function logout(setUser, User) {
  let obj = { ...User };
  obj.logged = false;
  obj.username = null;
  obj.email = null;
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  setUser(obj);
}

export function sortByRatingDescending(array) {
  return array.sort((a, b) => b.rating - a.rating);
}

export function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
