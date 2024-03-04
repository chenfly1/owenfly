import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill, { Quill } from 'react-quill';
import { ImageDrop } from 'quill-image-drop-module';
import './index.less';
import Method from '@/utils/Method';
import { publicMaterialLib } from '@/components/FileUpload/business';
import { generateGetUrl, generatePutUrl } from '@/services/file';
Quill.register('modules/imageDrop', ImageDrop);

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
  'background',
  'font',
  'align',
  'clean',
];

const getUuid = () => {
  const s: any[] = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 32; i++) {
    const dic = Math.floor(Math.random() * 0x10);
    s[i] = hexDigits.slice(dic, dic + 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.slice((s[19] & 0x3) | 0x8, ((s[19] & 0x3) | 0x8) + 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23];
  const uuid = s.join('');
  return uuid;
};

const uploadImage = (file: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const _objectId = `${publicMaterialLib.path}/${getUuid()}/${file.name}`;
      const res = await generatePutUrl({
        bussinessId: publicMaterialLib.id,
        urlList: [{ objectId: _objectId, contentType: file.type }],
      });
      const url = res.data.urlList[0].presignedUrl.url;
      const contentType = res.data.urlList[0].presignedUrl.headers['Content-Type'];
      const xOssCallback = res.data.urlList[0].presignedUrl.headers['x-oss-callback'];
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      xhr.setRequestHeader('Content-Type', contentType || 'application/json');
      xhr.setRequestHeader('x-oss-callback', xOssCallback);
      xhr.onreadystatechange = async () => {
        if (xhr.readyState === 4 && xhr.status == 200) {
          const resUrl = await generateGetUrl({
            bussinessId: publicMaterialLib.id,
            urlList: [
              {
                objectId: _objectId,
              },
            ],
          });
          resolve(resUrl.data.urlList[0].presignedUrl.url);
        }
      };
      xhr.send(file);
      console.log(res);
    } catch (error) {
      reject(error);
      console.log(error);
    }
  });
};

const Editor = forwardRef((props: any, refInstance) => {
  const { readOnly = false, closeClipboardImg = false, ...otherProps } = props;

  const reactQuillRef: any = useRef(null);

  // 上传图片
  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'multiple');
    input.click();
    input.onchange = async () => {
      Array.from(input.files as any).forEach(async (item: any) => {
        // 压缩图片
        const newImg = (await Method.compressorImage(item, 'file', 0.8)) as File;
        // 上传图片
        uploadImage(newImg).then((url) => {
          // 获取url
          const quill = reactQuillRef?.current?.getEditor(); //获取到编辑器本身
          const cursorPosition = quill.getSelection().index; //获取当前光标位置
          const link = url;
          quill.insertEmbed(cursorPosition, 'image', link); //插入图片
          quill.setSelection(cursorPosition + 1); //光标位置加1
        });
      });
    };
  };

  // 粘贴、拖拽上传图片
  const pasteDropImageUpload = (evt: any) => {
    if (evt.clipboardData && evt.clipboardData.files && evt.clipboardData.files.length) {
      evt.preventDefault();
      [].forEach.call(evt.clipboardData.files, async (file: any) => {
        console.log(file);
        if (!file.type.match(/^image\/(gif|jp?eg|g?png|bmp)/i)) {
          return;
        }
        // 压缩图片
        const newImg = (await Method.compressorImage(file, 'file', 0.8)) as File;
        // 上传图片
        uploadImage(newImg).then((url) => {
          // 获取url
          const quill = reactQuillRef?.current?.getEditor(); //获取到编辑器本身
          const cursorPosition = quill.getSelection().index; //获取当前光标位置
          const link = url;
          quill.insertEmbed(cursorPosition, 'image', link); //插入图片
          quill.setSelection(cursorPosition + 1); //光标位置加1
        });
      });
    }
  };

  useEffect(() => {
    const quill = reactQuillRef?.current?.getEditor();
    quill.root.addEventListener('paste', pasteDropImageUpload, false);
    quill.root.addEventListener('drop', pasteDropImageUpload, false);
    return () => {
      quill.root.removeEventListener('paste', pasteDropImageUpload);
      quill.root.removeEventListener('drop', pasteDropImageUpload);
    };
  }, []);

  // 对外暴露
  useImperativeHandle(refInstance, () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    focus: (_ = {}) => {
      reactQuillRef?.current?.focus?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getEditorContents: (_ = {}) => {
      return reactQuillRef?.current?.getEditorContents?.();
    },
    setEditorContents: (data: any) => {
      reactQuillRef?.current?.setEditorContents?.(reactQuillRef?.current?.getEditor(), data);
    },
    moveMouseEnd: () => {
      // 将光标移动到最后
      const editor = reactQuillRef?.current?.getEditor();
      editor.setSelection(9999, 0);
    },
  }));

  const toolbar = React.useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image'],
          [{ color: [] }, { background: [] }, { align: [] }],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchers: [
          // 粘贴事件和setEditorContents有冲突报错，但在readOnly=true的时候可以正常使用
          // 临时处理方式：需要setEditorContents的地方先将readOnly=true再使用，或者先去掉粘贴功能比如表单编辑的时候
          // closeClipboardImg ? [] : ['img', customImgForPaste],
        ],
      },
      imageDrop: true,
    }),
    [],
  );

  const defaultProps = {
    theme: 'snow',
    modules: toolbar,
    formats,
    placeholder: '请输入',
    // className: styles.default_style,
  };

  const readOnlyProps = readOnly
    ? {
        readOnly: true,
        modules: {},
        formats: {},
        theme: '',
      }
    : {};

  return (
    <>
      <ReactQuill ref={reactQuillRef} {...defaultProps} {...otherProps} {...readOnlyProps} />
    </>
  );
});

export default Editor;
