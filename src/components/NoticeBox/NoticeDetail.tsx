import React, { createRef, forwardRef, useImperativeHandle, useState } from 'react';
import AlarmNoticeDetail from '@/pages/security-center/alarm-events/alarm-log/detail';
import DrawerForm, { DrawerFormRef } from '../DrawerForm';
import { NoticeType, NoticeTypeMap } from './config';

type VisibleMap = { [key in NoticeType]: boolean };
export type DetailRef = { checkNotice: (notice: NoticeItemType) => void };

const TextDetail = DrawerForm(
  ({ source }: { source?: { text: string } }) => {
    return (
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        {source?.text ?? ''}
      </pre>
    );
  },
  {
    title: '消息详情',
    confirm: true,
  },
);

export default forwardRef<
  DetailRef,
  React.PropsWithChildren<{
    visibleMap?: VisibleMap;
    onOpen?: (notice: NoticeItemType) => void;
    onClose?: (notice: NoticeItemType) => void;
  }>
>((props, ref) => {
  const { visibleMap, children, onOpen, onClose } = props;
  const [notice, setNotice] = useState({} as any);
  const [visible, setVisible] = useState(visibleMap || ({} as VisibleMap));
  const textRef = createRef<DrawerFormRef<{ text: string }>>();

  const updateVisible = (key: string, value: boolean) => {
    setVisible((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (!value) onClose?.(notice);
  };

  /** 查看消息详情 */
  const checkNotice = (noticeItem: NoticeItemType) => {
    const id = noticeItem.link?.slice(noticeItem.link?.lastIndexOf('/') + 1);
    const type = NoticeTypeMap[noticeItem.type];
    if (id && type) {
      setNotice({ ...noticeItem, id });
      updateVisible(type, true);
      onOpen?.(noticeItem);
    } else {
      textRef?.current?.open({
        text: noticeItem.text,
      });
      onOpen?.(noticeItem);
    }
  };

  useImperativeHandle(ref, () => ({
    checkNotice,
  }));

  return (
    <>
      {children}
      <AlarmNoticeDetail
        data={notice}
        open={visible.alert}
        onOpenChange={(value) => {
          updateVisible(NoticeType.alert, value);
        }}
        onSubmit={() => {
          updateVisible(NoticeType.alert, false);
        }}
      />
      <TextDetail ref={textRef} submit={() => Promise.resolve(true)} />
    </>
  );
});
