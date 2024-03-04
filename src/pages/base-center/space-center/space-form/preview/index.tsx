import { Button, Cascader, Col, Row } from 'antd';
import { useEffect, useState } from 'react';

type batchNoteType = {
  name: string;
  prefixName?: string;
  spaceType: string;
  children?: batchNoteType[];
  childrenX?: batchNoteType[];
};

export type Props = {
  batchNode: batchNoteType[];
  onlyBuild: boolean;
};

const SpacePreview: React.FC<Props> = ({ batchNode, onlyBuild }) => {
  const [floorAndRoom, setFloorAndRoom] = useState<batchNoteType[]>([]);
  const [cascaderData, setCascaderData] = useState<batchNoteType[]>([]);

  const spaceTypeMap = {
    BUILDING: ' 栋',
    UNIT: ' 单元',
    ROOM: '',
    FLOOR: '',
  };

  const getCascaderData = (data: batchNoteType[]) => {
    const tData: batchNoteType[] = [];
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { name, spaceType, children } = node;
      tData.push({
        ...node,
        name: `${name}${spaceTypeMap[spaceType]}`,
        childrenX: ['ROOM', 'FLOOR'].includes((children?.length && children[0].spaceType) || '')
          ? getCascaderData(children!)
          : undefined,
        children: ['BUILDING', 'UNIT'].includes((children?.length && children[0].spaceType) || '')
          ? getCascaderData(children!)
          : undefined,
      });
    }
    return tData;
  };

  useEffect(() => {
    setCascaderData(getCascaderData(batchNode));
    setFloorAndRoom([]);
  }, [batchNode]);

  return (
    <>
      {onlyBuild ? (
        <>
          <Row style={{ marginBottom: '20px' }}>
            <span>{`共 ${cascaderData.length} 栋`}</span>
          </Row>
          <Row gutter={16}>
            {cascaderData.map((item) => (
              <Col key={item.name} span={3}>
                <div
                  style={{
                    marginBottom: '16px',
                    border: '1px dashed',
                    textAlign: 'center',
                    lineHeight: '30px',
                  }}
                >
                  {item.name}
                </div>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <>
          <Row style={{ marginBottom: '20px' }} align={'middle'}>
            <Col>
              <span>楼栋单元：</span>
            </Col>
            <Col>
              <Cascader
                fieldNames={{ label: 'name', value: 'name', children: 'children' }}
                options={cascaderData}
                onChange={(_value, selectOptions: any) => {
                  setFloorAndRoom(selectOptions[selectOptions.length - 1].childrenX || []);
                }}
                placeholder="请选择"
              />
            </Col>
          </Row>
          {floorAndRoom.length > 0 &&
            floorAndRoom.map((item) => (
              <Row key={item.name} gutter={16}>
                {item.childrenX?.length ? (
                  item.childrenX.map((itemX) => (
                    <Col key={itemX.name} span={3}>
                      <div
                        style={{
                          marginBottom: '16px',
                          border: '1px dashed',
                          textAlign: 'center',
                          lineHeight: '30px',
                        }}
                      >
                        {item.name + (parseInt(itemX.name) < 10 ? '0' + itemX.name : itemX.name)}
                      </div>
                    </Col>
                  ))
                ) : (
                  <Col span={24}>
                    <div
                      style={{
                        marginBottom: '16px',
                        border: '1px dashed',
                        textAlign: 'center',
                        lineHeight: '30px',
                      }}
                    >
                      {item.name}
                    </div>
                  </Col>
                )}
              </Row>
            ))}
        </>
      )}
    </>
  );
};

export default SpacePreview;
