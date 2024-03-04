import { AllSchemas, createComponentSchema } from '@designable/formily-antd';
import { ISchema } from '@formily/json-schema';
import { getDefaultValue } from './setters/DefaultValueSetter';
import { ValueTypeEnum } from './setters/EnumSetter';
import { getDefault } from './setters/EnumSetterV2';
import { UploadFile } from 'antd';
import { generateGetUrl, generatePutUrl } from '@/services/file';

export const createFieldSchema =
  (fieldProperty: ISchema['properties']) =>
  (component?: ISchema, decorator: ISchema = AllSchemas.FormItem): ISchema => ({
    type: 'object',
    properties: {
      'field-group': {
        type: 'void',
        'x-component': 'CollapseItem',
        properties: fieldProperty,
      },
      ...createComponentSchema(component!, decorator),
    },
  });

export const defaultValueHandler = (schema: any) => {
  const config = schema['x-custom-default'] || {};
  schema.default = getDefaultValue(config);
};

const initReactions = (schema: any) => {
  schema['x-reactions'] = schema['x-reactions'] || {};
  schema['x-reactions'].fulfill = schema['x-reactions'].fulfill || { run: '' };
  schema['x-reactions'].fulfill.run = '';
};

const appendAsyncDatasourceEffect = (schema: any, source: string) => {
  schema['x-reactions'] = schema['x-reactions'] || {};
  schema['x-reactions'].fulfill = schema['x-reactions'].fulfill || { run: '' };
  schema['x-reactions'].fulfill.run += `;$effect(() => {
    try {
      // 生产选项数据
      const transformOptions = (data) => {
        return (data || []).map(({ code, name, children }) => {
          return {
            label: name,
            value: code,
            children: children ? transformOptions(children) : undefined,
          };
        });
      };
      let env = /(dev|test|pre)-/.exec(location?.origin)
      if (!env) {
        env = location?.origin?.includes('localhost') ? 'dev' : 'prod'
      }
      const hosts = {
        dev: 'https://atopdev.aciga.com.cn',
        test: 'https://atoptest.aciga.com.cn',
        pre: 'https://pre-aiot.aciga.com.cn',
        prod: 'https://aiot.aciga.com.cn'
      }
      const host = hosts[env]
      let req = fetch(host + "/alita/flowcenter/base/dict/item?typeCode=${source}")
      if ('${source}' === '__person__') {
        req = fetch(host + "/alita/flowcenter/base/person/list")
      }
      $self.loading = true
      req.then((response) => response.json()).then(
          ({ data }) => {
            $self.loading = false
            $self.dataSource = transformOptions(data)
          },
          () => {
            $self.loading = false
          }
        )
      } catch (err) {
        console.log('async-datasource-error', err)
      }
    }, [])`;
  return schema;
};

export const enumHandler = (schema: any) => {
  try {
    const config = schema['x-custom-enum'] || {};
    if (config.valueType === ValueTypeEnum.static) {
      schema.enum = config.staticField;
    } else if (config.valueType === ValueTypeEnum.dynamic) {
      schema.enum = config.dynamicField;
      const source = config.dynamicSource ?? '';
      if (!source) return;
      appendAsyncDatasourceEffect(schema, source);
    }
    schema.default = getDefault(config);
  } catch (err) {
    console.log('x-enum-handler', err);
  }
};

export const enumHandlerV2 = (schema: any) => {
  try {
    const config = schema['x-custom-enum-v2'] || {};
    if (config.valueType === ValueTypeEnum.static) {
      schema.enum = config.staticField;
    } else if (config.valueType === ValueTypeEnum.dynamic) {
      schema.enum = config.dynamicField;
      const source = config.dynamicSource ?? '';
      if (!source) return;
      appendAsyncDatasourceEffect(schema, source);
    }
    schema.default = getDefault(config);
  } catch (err) {
    console.log('x-enumv2-handler', err);
  }
};

export const linkageHandler = (schema: any) => {
  try {
    const name = schema.name || schema['x-designable-id'];
    const config = schema['x-custom-linkage'] || {};
    schema['x-reactions'] = schema['x-reactions'] || {};
    schema['x-reactions'].fulfill = schema['x-reactions'].fulfill || { run: '' };
    schema['x-reactions'].fulfill.run += `;$effect(() => {
      try {
        const match = ${JSON.stringify(config)}.enum.find((item) => {
          return item.value === $self.value
        })
        if (match?.display?.length) {
          let matches = match.display.concat('${name}').reduce((prev, curr) => {
            const items = curr.split('.').reduce((p, c) => {
              return p.concat(c);
            }, []);
            return prev.concat(items);
          }, []).join('|')
          $form.setFieldState(new RegExp('^(' + matches + ')'), (state) => {
            state.display = "visible"
          })
          $form.setFieldState(new RegExp('^(?!.*(' + matches + '))'), (state) => {
            state.display = "hidden"
          })
        } else {
          $form.setFieldState(new RegExp('[\\s\\S]'), (state) => {
            state.display = "visible"
          })
        }
      } catch (err) {
        console.log('x-linkage-effect', err)
      }
    }, [$self.value])`;
  } catch (err) {
    console.log('x-linkage-handler', err);
  }
};

export const searchHandler = (schema: any) => {
  const config = schema['x-custom-search'];
  if (config === true) {
    schema['x-component-props'] = {
      ...(schema['x-component-props'] || {}),
      showSearch: true,
      filterOption: (input: string, option: { label: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
    };
  }
};

const uploadHandler = (schema: any) => {
  const config = schema['x-component-props'];
  if (!config.action) {
    schema['x-component-props'] = {
      name: 'file',
      customRequest: async (options: { file: UploadFile; onSuccess: (body: object) => void }) => {
        const bussiness = {
          id: 'public_material_lib',
          path: 'public/material',
        };
        const { onSuccess, file } = options;
        const objectId = `${bussiness.path}/${file.uid}/${file.name}`;
        const res = await generatePutUrl({
          bussinessId: bussiness.id,
          urlList: [{ objectId, contentType: file.type }],
        });
        const action = res.data.urlList[0].presignedUrl.url;
        const xhr = new XMLHttpRequest();
        const headers = res.data.urlList[0].presignedUrl.headers;
        xhr.open('PUT', action, true);
        const contentType = headers && headers['Content-Type'];
        const xOssCallback = headers && headers['x-oss-callback'];
        xhr.setRequestHeader('Content-Type', contentType || 'application/json');
        xhr.setRequestHeader('x-oss-callback', xOssCallback);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status == 200) {
            // 获取地址
            generateGetUrl({
              bussinessId: bussiness.id,
              urlList: [
                {
                  objectId: objectId,
                },
              ],
            }).then((info) => {
              if (info?.code === 'SUCCESS') {
                onSuccess({
                  ...file,
                  url: info?.data?.urlList?.[0]?.presignedUrl?.url,
                });
              } else {
              }
            });
          }
        };
        xhr.send(file as any);
      },
      ...config,
    };
  }
};

export const patchSchema = (schema: ISchema) => {
  try {
    initReactions(schema);
    if (schema['x-custom-default']) {
      defaultValueHandler(schema);
    }
    if (schema['x-custom-enum']) {
      enumHandler(schema);
    }
    if (schema['x-custom-enum-v2']) {
      enumHandlerV2(schema);
    }
    if (schema['x-custom-linkage']) {
      linkageHandler(schema);
    }
    if (schema['x-custom-search']) {
      searchHandler(schema);
    }
    if (schema['x-component'] === 'Upload' || schema['x-component'] === 'Upload.Dragger') {
      uploadHandler(schema);
    }
    if (schema.properties) {
      Object.values(schema.properties).forEach((property) => {
        patchSchema(property);
      });
    }
    if ((schema.items as any)?.properties) {
      Object.values((schema.items as any)?.properties).forEach((property: any) => {
        patchSchema(property);
      });
    }
    return schema;
  } catch (error) {
    console.log('patch-schema', error);
  }
};
