import React, { useEffect, useState } from 'react';
import { Modal, Table, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { batchDeletion } from '@/services/housekeeper';
import { storageSy } from '@/utils/Setting';
import { getPhysicalSpaceTree } from '../service';

interface Props {
  open: (open: boolean) => void;
  modalVisit: boolean;
  data: any;
  onSubmit: () => void; // 表单提交函数
}

interface Node {
  title: string;
  key: any;
  parentId: string | number;
  spaceType: string;
  children?: Node[];
}
const findTitleByKey = (key: any, data: Node[]): Node | null => {
  for (const item of data) {
    if (item.key === key) {
      return item;
    }
    if (item.children) {
      const result = findTitleByKey(key, item.children);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

const findTopLevelTitleByKey = (key: any, data: Node[]): string | null => {
  let node = findTitleByKey(key, data);
  while (node && node.parentId !== 0) {
    node = findTitleByKey(node.parentId + '', data);
  }
  return node ? node.title : null;
};
const appendProperties = (data: any[]) => {
  return data.map((item) => {
    const { name, id, children, ...rest } = item;
    const updatedItem = {
      title: name,
      key: id,
      ...rest,
    };
    if (children && children.length > 0) {
      updatedItem.children = appendProperties(children);
    }
    return updatedItem;
  });
};

const AddDele: React.FC<Props> = ({ open, modalVisit, data, onSubmit }) => {
  const [cascaderOptions, setCascaderOptions] = useState<any>();
  const [projectBid, setProjectBid] = useState<string>('');

  //提交
  const handleOk = () => {
    Modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: '确定删除吗？',
      centered: true,
      onOk: async () => {
        const idArray = data.filter((item: { id: any }) => item.id);
        console.log(idArray);
        const idArrays = idArray.map((item: any) => item.id);
        console.log(idArrays);

        const res = await batchDeletion({
          ids: idArrays,
        });
        if (res.code === 'SUCCESS') {
          message.success('删除成功');
          open(false);
          onSubmit();
        }
      },
    });
  };

  //关闭
  const handleCancel = () => {
    open(false);
  };

  const columns: ColumnsType<butlerPageType> = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 100,
      render: (text, record) => {
        const title = findTopLevelTitleByKey(record.spaceId, cascaderOptions);
        console.log(title); // 输出：KE项目
        return <>{title}</>;
      },
    },
    {
      title: '房间简称',
      dataIndex: 'spaceName',
      width: 100,
    },
    {
      title: '管家名称',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      width: 100,
    },
  ];

  useEffect(() => {
    const project = JSON.parse(sessionStorage.getItem('VprojectInfo') || ('{}' as string));
    console.log('project', project);
    setProjectBid(project?.bid);
    getPhysicalSpaceTree({
      projectBid: project?.bid,
      // 房产接口
      filterSpaceTypes: [
        'PROJECT',
        'PROJECT_STAGE',
        'BUILDING',
        'UNIT',
        'FLOOR',
        'ROOM',
        'PUBLIC_AREA',
      ],
      // filterSpaceTypes: ["CARPARK", "AREA", "PASSAGE"]
    }).then((res: { code?: any; data?: any }) => {
      if (res.code === 'SUCCESS') {
        const tree = appendProperties(res.data);
        setCascaderOptions(tree);
      }
    });

    return () => {};
  }, [modalVisit]);

  return (
    <Modal
      title="删除项目管家"
      open={modalVisit}
      onOk={handleOk}
      onCancel={handleCancel}
      width={994}
    >
      <div style={{ display: 'flex' }}>
        <div>
          <WarningFilled style={{ color: 'red', fontSize: '50px', marginRight: '20px' }} />
        </div>

        <div>
          <h3>
            <b>
              是否确认删除以下
              <span style={{ color: 'red' }}>{JSON.stringify(data?.length)}个</span>
              项目的管家信息？
            </b>
          </h3>
          <p>删除后不可数据不可恢复，请谨慎选择</p>
        </div>
      </div>
      <Table dataSource={data} columns={columns} pagination={{ pageSize: 10 }} size="small" />
    </Modal>
  );
};

export default AddDele;
