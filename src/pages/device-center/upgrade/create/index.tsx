import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ProFormDatePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
  StepsForm,
} from '@ant-design/pro-components';
import { Button, message, Tooltip, Upload } from 'antd';
import { createRef, useRef, useState } from 'react';
import DeviceModal, { UpgradeTaskCreateProps } from './device';
import { ModalFormRef } from '@/components/ModalForm';
import { PageContainer } from '@ant-design/pro-layout';
import Style from './index.less';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  DependencyVersionUpgradeOptions,
  RetryTaskOptions,
  SourceEnum,
  SourceMap,
  UpgradeSourceMap,
  UpgradeTypeMap,
} from '../config';
import { useInitState } from '@/hooks/useInitState';
import { DeviceState } from '@/models/useDevice';
import { Method } from '@/utils';
import { deviceBusiness } from '@/components/FileUpload/business';
import { createProductUpgradeTask, getUpgradeSourceVersion } from '@/services/device';
import { history } from 'umi';
import moment from 'moment';

export default () => {
  const baseRef = useRef<ProFormInstance>();
  const sourceRef = useRef<ProFormInstance>();
  const ruleRef = useRef<ProFormInstance>();
  const deviceRef = createRef<ModalFormRef<UpgradeTaskCreateProps>>();
  const { productMap } = useInitState<DeviceState>('useDevice', ['productMap']);
  const [devices, setDevices] = useState<UpgradeTaskCreateProps['devices']>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [upgradeSource, setUpgradeSource] = useState<{
    values: Record<string, { label: string; value: number }[]>;
    loading: boolean;
    key: string;
    help: string;
  }>({ loading: false, key: '', help: '', values: {} });

  const beforeUpload = async (file: any) => {
    // 校验文件大小
    if (file.size === 0) {
      message.error('文件不能为空, 请重新选择文件');
      return Upload.LIST_IGNORE;
    }
    const exceed5M = file.size / 1024 / 1024 > 2000;
    if (exceed5M) {
      message.error('文件不能超过2000M, 请重新选择文件');
      return Upload.LIST_IGNORE;
    }
    return Promise.resolve(file);
  };

  const updateUpgradeSource = async () => {
    const product = baseRef.current?.getFieldValue('productId');
    const type = sourceRef.current?.getFieldValue('firmwareType');
    const key = `${type}_${product}`;
    if (!type) return;
    if (updateUpgradeSource[key]) {
      return sourceRef.current?.setFieldsValue({
        targetVersion: updateUpgradeSource[key]?.[0]?.label,
        targetVersionCode: updateUpgradeSource[key]?.[0]?.value,
        firmwareUrl: updateUpgradeSource[key]?.[0]?.url,
        firmwareSize: updateUpgradeSource[key]?.[0]?.size,
      });
    }
    setUpgradeSource((prev) => ({ ...prev, loading: true }));
    const res = await getUpgradeSourceVersion({
      resourceName: type,
      resourceVersionCode: -1,
      productId: product,
      userdebug: REACT_APP_ENV === 'prod' ? false : true,
    }).catch(() => null);
    if (res) {
      const value = [
        {
          label: res.definition.versionName,
          value: res.definition.versionCode,
          source: res.definition,
        },
      ];
      sourceRef.current?.setFieldsValue({
        targetVersion: value[0].label,
        targetVersionCode: value[0].value,
        firmwareUrl: value[0].source.url,
        firmwareSize: value[0].source.size,
      });
      setUpgradeSource((prev) => {
        return {
          loading: false,
          key,
          help: '',
          values: {
            ...prev.values,
            [key]: value,
          },
        };
      });
    } else {
      sourceRef.current?.setFieldsValue({
        targetVersion: undefined,
        targetVersionCode: undefined,
        firmwareUrl: undefined,
        firmwareSize: undefined,
      });
      setUpgradeSource((prev) => ({
        ...prev,
        loading: false,
        help: '暂无资源',
      }));
    }
  };

  const submit = async () => {
    await ruleRef.current?.validateFields();
    setSubmitting(true);
    const { productId } = baseRef.current?.getFieldsValue();
    const {
      firmwareType,
      resourceSource,
      file,
      targetVersion,
      targetVersionCode,
      firmwareUrl,
      firmwareSize,
    } = sourceRef.current?.getFieldsValue();
    const { upgradeTime, ...rule } = ruleRef.current?.getFieldsValue();
    createProductUpgradeTask({
      productId,
      didTaskCreateCmds: devices.map((item) => ({
        deviceId: item.deviceId,
        tenantId: item.tenantId,
        projectBid: item.projectBid,
      })),
      firmwareType: UpgradeSourceMap[firmwareType],
      resourceSource,
      upgradeTime: moment(upgradeTime).format('YYYY-MM-DD HH:mm:ss'),
      ...rule,
      ...(resourceSource === `${SourceEnum.local}`
        ? {
            fileObjectId: file?.[0]?.response?.path,
            firmwareUrl: file?.[0]?.response?.path,
            firmwareSize: file?.[0]?.response?.size / 1024, // kb 单位
            targetVersion: file?.[0]?.response?.name,
            targetVersionCode: undefined,
            businessId: deviceBusiness.id,
          }
        : {
            firmwareUrl,
            firmwareSize,
            targetVersion,
            targetVersionCode,
          }),
    })
      .then(() => {
        history.push({
          pathname: '/super-admin/device-center/device-upgrade',
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const range = (start: number, end: number) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  const disabledTime = (date: any) => {
    const curr = moment();
    const disabledHours = () => range(0, 24).splice(0, curr.hours());
    const disabledMinutes = () => range(0, 60).splice(0, curr.minutes());
    const disabledSeconds = () => range(0, 60).splice(0, curr.seconds());
    if (date?.format('YYYY-MM-DD').valueOf() === curr.format('YYYY-MM-DD').valueOf()) {
      if (date?.format('HH').valueOf() === curr.format('HH').valueOf())
        return {
          disabledHours,
          disabledMinutes,
          disabledSeconds:
            date?.format('mm').valueOf() === curr.format('mm').valueOf()
              ? disabledSeconds
              : undefined,
        };
      return {
        disabledHours,
      };
    } else {
      return {};
    }
  };

  return (
    <PageContainer
      className={Style.upgrade_create}
      header={{
        title: null,
      }}
    >
      <StepsForm<{ name: string }>
        onFinish={async () => {
          message.success('提交成功');
        }}
        stepsProps={{
          size: 'small',
        }}
        submitter={{
          render: (props) => {
            if (props.step === 0) {
              return (
                <Button type="primary" onClick={() => props.onSubmit?.()}>
                  下一步
                </Button>
              );
            } else if (props.step === 1) {
              return [
                <Button key="pre" onClick={() => props.onPre?.()}>
                  上一步
                </Button>,
                <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                  下一步
                </Button>,
              ];
            } else {
              return [
                <Button key="pre" onClick={() => props.onPre?.()}>
                  上一步
                </Button>,
                <Button type="primary" key="submit" loading={submitting} onClick={() => submit()}>
                  完成创建
                </Button>,
              ];
            }
          },
        }}
        formProps={{
          colon: false,
          layout: 'horizontal',
          labelCol: { flex: '80px' },
          validateMessages: {
            required: '此项为必填项',
          },
        }}
      >
        <StepsForm.StepForm<{
          name: string;
        }>
          name="base"
          title="明确范围"
          formRef={baseRef}
        >
          <ProFormSelect
            name="productId"
            label="所属产品"
            valueEnum={productMap.value}
            fieldProps={{
              loading: productMap.loading,
              onChange: () => {
                baseRef.current?.setFieldValue('didTaskCreateCmds', []);
              },
            }}
            rules={[{ required: true }]}
          />
          <ProFormDependency name={['productId']}>
            {({ productId }) => {
              if (!productId) return null;
              return (
                <>
                  <ProFormSelect
                    name="didTaskCreateCmds"
                    label="选择设备"
                    rules={[{ required: true }]}
                    fieldProps={{
                      open: false,
                      mode: 'multiple',
                      options: devices as any,
                      fieldNames: { label: 'name', value: 'deviceId' },
                      maxTagCount: 10,
                      onClick: () => {
                        const values: string[] =
                          baseRef.current?.getFieldValue('didTaskCreateCmds');
                        const model = (productMap.value?.[productId] ?? '').match(
                          /（([^）]*)）[^\（\）]*$/,
                        )?.[1];
                        if (model) {
                          deviceRef.current?.open({
                            model,
                            devices: devices.filter((item) => values.includes(item.deviceId)),
                          });
                        }
                      },
                    }}
                  />
                </>
              );
            }}
          </ProFormDependency>
          <DeviceModal
            ref={deviceRef}
            submit={async (values) => {
              setDevices(values.devices);
              baseRef.current?.setFieldsValue({
                didTaskCreateCmds: values.devices.map((item) => item.deviceId),
              });
              return true;
            }}
          />
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="source"
          title="获取资源"
          formRef={sourceRef}
          labelCol={{ flex: '100px' }}
          style={{
            marginLeft: '-20px',
          }}
        >
          <ProFormSelect
            name="firmwareType"
            label="升级类型"
            valueEnum={UpgradeTypeMap}
            rules={[{ required: true }]}
            fieldProps={{
              onChange: () => {
                const resource = sourceRef.current?.getFieldValue('resourceSource');
                if (resource === `${SourceEnum.remote}`) {
                  updateUpgradeSource();
                }
              },
            }}
          />
          <ProFormSelect
            name="resourceSource"
            label="资源路径"
            rules={[{ required: true }]}
            valueEnum={SourceMap}
            fieldProps={{
              onChange: (value) => {
                if (value === `${SourceEnum.remote}`) {
                  updateUpgradeSource();
                }
              },
            }}
          />
          <ProFormText name="firmwareUrl" hidden />
          <ProFormText name="firmwareSize" hidden />
          <ProFormDependency name={['firmwareType', 'resourceSource']}>
            {({ firmwareType, resourceSource }) => {
              if (!resourceSource || !firmwareType) return null;
              if (resourceSource === `${SourceEnum.remote}`) {
                return (
                  <>
                    <ProFormText name="targetVersion" hidden />
                    <ProFormSelect
                      name="targetVersionCode"
                      label="选择升级资源"
                      help={
                        <div
                          className={`${Style.upgrade_create_help} ${Style.upgrade_create_help_select}`}
                        >
                          <InfoCircleOutlined />
                          <span>
                            默认最新版本{upgradeSource.help ? `, ${upgradeSource.help}` : ''}
                          </span>
                        </div>
                      }
                      rules={[{ required: true }]}
                      fieldProps={{
                        loading: upgradeSource.loading,
                        options: upgradeSource.values?.[upgradeSource.key],
                      }}
                      disabled
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <ProFormText hidden name="businessId" />
                    <ProFormUploadDragger
                      name="file"
                      label=" "
                      icon={false}
                      title={false}
                      required={false}
                      help={
                        <div style={{ marginBottom: '24px' }}>
                          文件大小不超过2,000 MB, 仅支持.img.zip.bin.hex.swu格式
                        </div>
                      }
                      rules={[
                        { required: true },
                        {
                          validator: async (_, value) => {
                            const hasValue = value.some(
                              (item: any) => item.status === 'done' && item?.response?.path,
                            );
                            if (!hasValue) throw new Error('error');
                          },
                          validateTrigger: ['onBlur'],
                        },
                      ]}
                      description={
                        <>
                          <a>点击上传</a> / 拖拽到此区域
                        </>
                      }
                      fieldProps={{
                        maxCount: 1,
                        accept: '.img,.zip,.bin,.hex,.swu',
                        beforeUpload: beforeUpload,
                        customRequest: async (options: any) => {
                          const { file, onSuccess } = options;
                          Method.uploadFile(file, deviceBusiness).then((url) => {
                            onSuccess({ name: file.name, size: file.size, path: url }, file);
                          });
                        },
                      }}
                    />
                  </>
                );
              }
            }}
          </ProFormDependency>
        </StepsForm.StepForm>
        <StepsForm.StepForm
          name="rule"
          title="补充规则"
          formRef={ruleRef}
          labelCol={{ flex: '160px' }}
          style={{
            marginLeft: '-80px',
          }}
        >
          <ProFormDatePicker
            name="upgradeTime"
            label="升级时间"
            fieldProps={{
              showTime: { format: 'HH:mm:ss' },
              format: 'YYYY-MM-DD HH:mm:ss',
              disabledTime,
              disabledDate: (curr) => {
                return curr < moment().startOf('day');
              },
            }}
            rules={[{ required: true }]}
          />
          <ProFormRadio.Group
            name="dependencyVersionUpgrade"
            label="依赖版本是否补充更新"
            rules={[{ required: true }]}
            help={
              <div className={`${Style.upgrade_create_help} ${Style.upgrade_create_help_radio}`}>
                <Tooltip
                  placement="right"
                  color="transparent"
                  trigger={['hover', 'click']}
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  overlayClassName={Style.upgrade_create_help_tip}
                  title="更新对应的依赖版本是升级至目标版本的前提条件，否则默认任务失败；本地上传文件更新的方式无法实现该场景。"
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </div>
            }
            initialValue="0"
            fieldProps={{
              optionType: 'button',
              options: DependencyVersionUpgradeOptions,
            }}
          />
          <ProFormRadio.Group
            name="isRetry"
            label="任务失败是否自动重试"
            rules={[{ required: true }]}
            initialValue="0"
            help={
              <div className={`${Style.upgrade_create_help} ${Style.upgrade_create_help_radio}`}>
                <Tooltip
                  placement="right"
                  color="transparent"
                  trigger={['hover', 'click']}
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  overlayClassName={Style.upgrade_create_help_tip}
                  title="由于网络传输等原因导致的任务失败，通过自动重试可提高升级效率，系统默认重试的间隔时长为1分钟，共重试3次。"
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </div>
            }
            fieldProps={{
              optionType: 'button',
              options: RetryTaskOptions,
            }}
          />
          <ProFormTextArea
            name="upgradeDescription"
            label="升级描述"
            placeholder="请描述此次升级的内容"
            fieldProps={{
              maxLength: 200,
            }}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </PageContainer>
  );
};
