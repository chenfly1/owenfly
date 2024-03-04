import { getMeterList, getTotalPageSource } from '@/services/energy';
import { useInitState } from '@/hooks/useInitState';
import { ProFormItem, ProFormText } from '@ant-design/pro-components';
import LazyTree, { LazyTreeRef } from '@/components/LazyTree';
import ModalForm from '@/components/ModalForm';
import { useEffect, useRef, useState } from 'react';
import { EnergyState } from '@/models/useEnergy';

export interface MeterTreeFormProps {
  id?: string;
  values?: string[];
  leafValues?: string[];
}

export default (props: Parameters<typeof ModalForm>[1] & { params?: any }) =>
  ModalForm<MeterTreeFormProps>(
    ({ visible }: { visible?: boolean }) => {
      const [loading, setLoading] = useState(true);
      const { measureTree } = useInitState<EnergyState>('useEnergy', ['measureTree']);
      const lazyTreeRef = useRef<LazyTreeRef<{
        key: string;
        title: string;
        isLeaf?: boolean;
      }> | null>(null);

      /** 获取全量仪表列表 */
      const getMeters = async (meterSpaceIds: string[]) => {
        const res = await getTotalPageSource<MeterItemType>(getMeterList, {
          ...(props.params || {}),
          meterSpaceId: meterSpaceIds,
          pageNo: 1,
          pageSize: 999,
        });
        return res?.items?.map((item: any) => ({
          key: item.id,
          title: item.cnName,
          isLeaf: true,
        }));
      };

      /** 加载节点数据 */
      const request = async (
        node: any,
      ): Promise<{ key: string; title: string; isLeaf?: boolean }[]> => {
        if (node?.data?.data?.meterSpaceName) {
          const nestMeasure = node.data.nestData.map((item: MeasureTreeType) => ({
            ...item,
            children: [],
            nestData: item.children,
          }));
          const meters = await getMeters([node.key]);
          return nestMeasure.concat(meters);
        } else {
          return [];
        }
      };

      useEffect(() => {
        if (visible && measureTree.inited) {
          const { children, ...values } = measureTree.value?.[0] || {};
          getMeters([values?.key, '-1'])
            .then((res: any) => {
              const treeData = [
                {
                  ...values,
                  loaded: true,
                  children: children
                    .map((item) => ({ ...item, children: [], nestData: item.children }))
                    .concat(res),
                },
              ];
              lazyTreeRef?.current?.initSource?.(treeData, () => {
                lazyTreeRef?.current?.updateExpandedKeys([`${values.key}`]);
              });
            })
            .finally(() => setLoading(false));
        }
      }, [visible, measureTree.inited]);

      return (
        <>
          <ProFormText name="id" hidden />
          <ProFormText name="leafValues" hidden />
          <ProFormItem noStyle shouldUpdate>
            {(form) => {
              return (
                <ProFormItem style={{ width: '100%' }} name="values">
                  <LazyTree
                    showRootNode
                    checkable={true}
                    request={request}
                    loading={loading}
                    getRef={(ref) => {
                      lazyTreeRef.current = ref;
                    }}
                    fieldNames={{
                      checkable: (node) => {
                        if (
                          node.isLeaf ||
                          (node.loaded && node.children?.filter((item) => item.isLeaf).length)
                        )
                          return true;
                        return false;
                      },
                    }}
                    defaultCheckedKeys={form.getFieldValue('values')}
                    onCheck={(values, { checkedNodes }) => {
                      form.setFieldsValue({
                        values,
                        leafValues: checkedNodes
                          .filter(({ data }) => data.isLeaf)
                          .map((item) => item.key),
                      });
                    }}
                  />
                </ProFormItem>
              );
            }}
          </ProFormItem>
        </>
      );
    },
    { height: 400, ...props },
  );
