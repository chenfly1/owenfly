import {
  FormListActionType,
  ProFormCheckbox,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';

import Style from '../index.less';
import { useEffect, useRef, useState } from 'react';

const TimeEnumMap = { 1: '小时', 2: '天' };
const defaultOption = [{ label: '所有流程', value: '' }];

export default (props: { nodes: any[] }) => {
  const [list, setList] = useState<{ label: string; value: string }[]>(defaultOption);
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();
  useEffect(() => {
    setList(
      defaultOption.concat(
        props.nodes
          .filter((item) => {
            return item?.id?.startsWith('Activity_');
          })
          .map((item) => ({
            label: item.name,
            value: item.id,
          })),
      ),
    );
  }, [props.nodes]);
  return (
    <div className={Style.flow_update_setting_form}>
      <ProFormText hidden name="settingId" />
      <ProFormText hidden name="timeoutId" />
      <ProFormGroup
        title={
          <div
            className={`${Style.flow_update_setting_item} ${Style.flow_update_setting_item_main}`}
            style={{ justifyContent: 'space-between' }}
          >
            <span className={Style.flow_update_setting_item_before}>超时设置</span>
            <ProFormSwitch name="timeOutNotify" />
          </div>
        }
      >
        <ProFormList
          name="list"
          min={1}
          max={list.length - 1}
          copyIconProps={false}
          actionRef={actionRef}
          itemRender={({ listDom }, listMeta) => {
            return (
              <div className={Style.flow_update_setting_block}>
                {listDom}
                {(actionRef?.current?.getList()?.length || 0) > 1 ? (
                  <a
                    className={Style.flow_update_setting_remove}
                    onClick={() => {
                      actionRef.current?.remove(listMeta.index);
                    }}
                  >
                    删除节点
                  </a>
                ) : null}
              </div>
            );
          }}
          creatorButtonProps={{
            icon: false,
            type: 'text',
            style: {
              width: 'auto',
              padding: 0,
              color: '#0d74ff',
            },
            creatorButtonText: '添加节点',
          }}
          containerClassName="condition_and"
        >
          <div className={Style.flow_update_setting_item}>
            <span className={Style.flow_update_setting_item_before}>流程到达</span>
            <ProFormSelect
              name="taskDefKey"
              fieldProps={{
                options: list,
              }}
            />
            <span className={Style.flow_update_setting_item_after}>节点</span>
          </div>
          <ProFormGroup
            title={<div className={Style.flow_update_setting_item_second}>超时触发时间</div>}
          >
            <div className={Style.flow_update_setting_item}>
              <ProFormDigit name="timeOutNum" min={0} />
              <ProFormSelect
                className={Style.flow_update_setting_item_after}
                name="timeOutUnit"
                valueEnum={TimeEnumMap}
              />
              <span className={Style.flow_update_setting_item_after}>后，触发超时提醒</span>
            </div>
          </ProFormGroup>
          <ProFormGroup
            title={
              <div
                className={`${Style.flow_update_setting_item} ${Style.flow_update_setting_item_second}`}
                style={{ justifyContent: 'space-between' }}
              >
                <span className={Style.flow_update_setting_item_before}>超时预警时间</span>
                <ProFormSwitch name="warnNotify" />
              </div>
            }
          >
            <div className={Style.flow_update_setting_item}>
              <span className={Style.flow_update_setting_item_before}>超时前</span>
              <ProFormDigit name="warnNum" min={0} />
              <ProFormSelect
                className={Style.flow_update_setting_item_after}
                name="warnUnit"
                valueEnum={TimeEnumMap}
              />
              <span className={Style.flow_update_setting_item_after}>触发预警</span>
            </div>
          </ProFormGroup>
          <ProFormGroup
            title={<div className={Style.flow_update_setting_item_second}>选择通知人</div>}
          >
            <ProFormCheckbox.Group
              name="notice"
              valueEnum={{ notifyInitiator: '工单发起人', notifyNodeOwner: '节点负责人' }}
            />
          </ProFormGroup>
        </ProFormList>
      </ProFormGroup>
      <ProFormGroup
        title={
          <div
            className={`${Style.flow_update_setting_item} ${Style.flow_update_setting_item_main}`}
            style={{ justifyContent: 'space-between', marginTop: '30px' }}
          >
            <span className={Style.flow_update_setting_item_before}>通知设置</span>
          </div>
        }
      >
        <ProFormGroup
          title={
            <div
              className={`${Style.flow_update_setting_item} ${Style.flow_update_setting_item_second}`}
              style={{ justifyContent: 'space-between' }}
            >
              <span className={Style.flow_update_setting_item_before}>待办事项</span>
              <ProFormSwitch name="userNotify" />
            </div>
          }
        >
          <span className={Style.flow_update_setting_item}>
            当节点有新的待办事项时（包含转办），对节点负责人进行提醒
          </span>
        </ProFormGroup>
        <ProFormGroup
          title={
            <div
              className={`${Style.flow_update_setting_item} ${Style.flow_update_setting_item_second}`}
              style={{ justifyContent: 'space-between' }}
            >
              <span className={Style.flow_update_setting_item_before}>工单结果</span>
              <ProFormSwitch name="resultNotify" />
            </div>
          }
        >
          <span className={Style.flow_update_setting_item}>
            流程结束后，对发起人进行结果通知，包括：已通过、已拒绝
          </span>
        </ProFormGroup>
      </ProFormGroup>
    </div>
  );
};
