const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const rootDir = process.cwd();

const execute = (command, prefix) => {
  prefix && console.log(`${prefix} start`);
  execSync(command, { stdio: 'inherit' });
  prefix && console.log(`${prefix} success`, '\n');
};

// 打印版本信息
execute('node -v', 'check node version');
execute('npm -v', 'check npm version');

const safeParse = (str, defaultRes = '') => {
  try {
    const res = JSON.parse(str);
    return res;
  } catch (err) {
    console.log('build:safe_parse_error:', err);
    return defaultRes;
  }
};

// 比较依赖包文件，若有变更，则返回 true
const comparePackage = (pkg, oldPkg = {}) => {
  console.log('compare package start');
  const successLog = 'compare package success';
  if (pkg.cache_version !== oldPkg.cache_version) {
    console.log(`${successLog}:cache_version:${pkg.cache_version}:${oldPkg.cache_version}`);
    return true;
  }
  const values = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const oldValues = { ...(oldPkg.dependencies || {}), ...(oldPkg.devDependencies || {}) };
  const [valueKeys, oldValueKeys] = [Object.keys(values), Object.keys(oldValues)];
  if (valueKeys.length !== oldValueKeys.length) {
    console.log(`${successLog}:package_length:${valueKeys.length}:${oldValueKeys.length}`);
    return true;
  }
  const res = valueKeys.some((key) => {
    const [match, oldMatch] = [values[key], oldValues[key]];
    if (match !== oldMatch) {
      console.log(`${successLog}:package_diff:${key + match}:${oldMatch}`);
      return true;
    }
    return false;
  });
  if (!res) console.log(`${successLog}`);
  return res;
};

// 检测是否移除缓存文件
try {
  const packagePath = path.resolve(rootDir, './package.json');
  const cachePackagePath = path.resolve(rootDir, './.cachepackage');
  const packageJSON = fs.existsSync(packagePath) ? require(packagePath) : {};
  const cachePackage = fs.existsSync(cachePackagePath)
    ? safeParse(fs.readFileSync(cachePackagePath).toString())
    : {};
  if (comparePackage(packageJSON, cachePackage)) {
    // 清理项目旧文件夹
    console.log('clear cache file start');
    const packageLockPath = path.resolve(rootDir, './package-lock.json');
    const nodeModulePath = path.resolve(rootDir, './node_modules');
    fs.existsSync(packageLockPath) && fs.unlinkSync(packageLockPath);
    fs.existsSync(nodeModulePath) && fs.rmdirSync(nodeModulePath, { recursive: true });
    console.log('clear cache file success');
    fs.writeFileSync(cachePackagePath, JSON.stringify(packageJSON), {
      flag: 'w',
    });
    // 清理 npm 缓存
    execute('npm cache clean -f', 'clean npm cache');
    // 设置 cdn 及 registry
    execute('npm set ENTRYCLI_CDNURL=https://cdn.npm.taobao.org/dist/sentry-cli');
    execute('npm set sentrycli_cdnurl=https://cdn.npm.taobao.org/dist/sentry-cli');
    execute('npm config set registry https://registry.npm.taobao.org/');
    // 安装
    execute('npm install --legacy-peer-deps', 'install packages');
  }
} catch (err) {
  console.error('build:remove_cache_error:', err);
}
