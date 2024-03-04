interface Config {
  host?: string;
  xspec_host?: string;
  client_id?: string;
  client_secret?: string;
  grant_type?: string;
  scope?: string;
}

const configEnvMap: Record<string, Config> = {
  dev: {
    host: 'https://atopdev.aciga.com.cn/alita',
    xspec_host: 'https://atoptest.aciga.com.cn/xspec',
    grant_type: 'password',
    client_id: 'f74420a9-9377-416f-9636-c62c05f1e020',
    scope: 'read,write,userinfo',
    client_secret: 'b73256427a174f488095a1520e17fe5d',
  },
  test: {
    host: 'https://atoptest.aciga.com.cn/alita',
    xspec_host: 'https://atoptest.aciga.com.cn/xspec',
    grant_type: 'password',
    client_id: 'f74420a9-9377-416f-9636-c62c05f1e020',
    scope: 'read,write,userinfo',
    client_secret: 'b73256427a174f488095a1520e17fe5d',
  },
  pre: {
    host: 'https://pre-aiot.aciga.com.cn/alita',
    xspec_host: 'https://atoptest.aciga.com.cn/xspec',
    grant_type: 'password',
    client_id: 'f74420a9-9377-416f-9636-c62c05f1e020',
    scope: 'read,write,userinfo',
    client_secret: 'b73256427a174f488095a1520e17fe5d',
  },
  prod: {
    host: 'https://aiot.aciga.com.cn/alita',
    xspec_host: 'https://aiot.aciga.com.cn/xspec',
    grant_type: 'password',
    client_id: 'f74420a9-9377-416f-9636-c62c05f1e020',
    scope: 'read,write,userinfo',
    client_secret: 'b73256427a174f488095a1520e17fe5d',
  },
};

const varticalConfig = {
  'park-center': 'alitaParking',
  'pass-center': 'alitaDoor',
  'content-center': 'alitaContent',
};

// if (REACT_APP_ENV === 'prod') {
//   config = {};
// } else if (REACT_APP_ENV === 'dev') {
//   config = {};
// }
const config = configEnvMap[REACT_APP_ENV];
export { config, varticalConfig };
