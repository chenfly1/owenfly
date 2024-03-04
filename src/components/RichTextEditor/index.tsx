import { Editor } from '@tinymce/tinymce-react';
import 'tinymce/skins/ui/oxide/skin.css';
import { message } from 'antd';
import { publicMaterialLib } from '../FileUpload/business';
import { generateGetUrl, generatePutUrl } from '@/services/file';
import './index.less';

interface Props {
  content: string | undefined;
  setContent: Function;
}

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
      message.error('图片上传失败');
      console.log(error);
    }
  });
};

const imagesUploadHandler = (blobInfo: any) =>
  new Promise((resolve, reject) => {
    if ('image/jpeg, image/png'.indexOf(blobInfo.blob().type) >= 0) {
      //调用自己实现的后台文件上传api
      uploadImage(blobInfo.blob())
        .then((url) => {
          // 获取url
          resolve(url as any);
        })
        .catch(() => {
          message.error('图片上传失败');
        });
    } else {
      reject('上传图片只能是 JPG 或 PNG 格式!');
      message.error('上传图片只能是 JPG 或 PNG 格式!');
    }
  });

const TinyMceEditor: React.FC<Props & Record<string, any>> = (props) => {
  const { content, setContent, ...rest } = props;

  const handleEditorChange = (text: any) => {
    setContent(text);
  };

  //上传视频
  // const file_picker_callback = async (cb, value, meta) => {
  //   //当点击meidia图标上传时,判断meta.filetype == 'media'有必要，因为file_picker_callback是media(媒体)、image(图片)、file(文件)的共同入口
  //   if (meta.filetype == 'media') {
  //       //创建一个隐藏的type=file的文件选择input
  //       let input = document.createElement('input');
  //       input.setAttribute('type', 'file');
  //       input.onchange = async function () {
  //           let file = this.files[0];
  //           var formData;
  //           formData = new FormData();
  //           //假设接口接收参数为file,值为选中的文件
  //           formData.append('img', file);
  //           //正式使用将下面被注释的内容恢复
  //           let data = await update_img(formData); //update_img是自己定义的上传图片视频方法,需要自行封装，很简单
  //           // console.log(data);
  //           cb(data.url)
  //       }
  //       //触发点击
  //       input.click();
  //   }
  // }

  return (
    <Editor
      inline={false}
      value={content}
      //获取你自己的key  地址：https://www.tiny.cloud/my-account/dashboard/
      apiKey="oklip42lle3bnis84knc3iyilrgl36btvq65qkuss8gawi9u"
      //指向第二步下载到public目录下的tinymce静态文件
      tinymceScriptSrc={'/tinymce/js/tinymce/tinymce.min.js'}
      id={getUuid()}
      init={{
        placeholder: '请输入',
        statusbar: false, // 隐藏底部状态栏
        branding: false, // 隐藏tinymce右下角水印
        resize: false, //右下角调整编辑器大小，false关闭，true开启只改变高度，'both' 宽高都能改变
        promotion: false,
        height: 800, //高度
        min_height: 800,
        language: 'zh_CN', //语言包
        // menubar: false, //菜单栏设置隐藏
        content_style:
          'p, div {font-size: 14px; margin: 0px; border:0px ; padding: 0px} img{ max-width:100%; display:block;height:auto; }', //文本内容中“p,div”标签进行行间距设置
        menubar: 'file edit view insert format table help',
        menu: {
          file: {
            title: '文件',
            items: 'newdocument restoredraft | preview | print',
          },
          edit: {
            title: '编辑',
            items: 'undo redo | cut copy paste | selectall | searchreplace',
          },
          view: {
            title: '查看',
            items: 'visualaid visualchars visualblocks | spellchecker | preview fullscreen',
          },
          insert: {
            title: '插入',
            // media template
            items:
              'image link file codesample inserttable | charmap hr | pagebreak nonbreaking anchor | insertdatetime',
          },
          format: {
            title: '格式化',
            items:
              'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat',
          },
          // tools: {
          //   title: '工具',
          //   items: 'spellchecker spellcheckerlanguage | code ',
          // },
          table: {
            title: '表格',
            items: 'inserttable | cell row column | tableprops deletetable',
          },
          help: {
            title: '帮助',
            items: 'help',
          },
        },
        plugins: [
          'autolink',
          'print',
          'link',
          'image ',
          'lists',
          'charmap',
          'preview',
          'anchor',
          'pagebreak',
          'visualblocks',
          'visualchars',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'nonbreaking',
          'table',
          'directionality',
          'emoticons',
          'template',
          'preview',
        ],
        toolbar: [
          ' bold underline italic alignleft aligncenter alignright | forecolor backcolor | h1 h2 h3 fontfamily fontsize lineheight | bullist numlist outdent indent |link image table | undo redo | fullscreen',
        ],
        font_size_formats: '8px 10px 12px 14px 18px 24px 36px',
        font_family_formats:
          "微软雅黑='微软雅黑';宋体='宋体';黑体='黑体';仿宋='仿宋';楷体='楷体';隶书='隶书';幼圆='幼圆';Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings",
        line_height_formats: '1 1.2 1.4 1.6 2',
        images_upload_credentials: true,
        // image_uploadtab: false, // 图片对话框中上传标签开关
        image_dimensions: false, // 显示隐藏图片尺寸input
        image_description: false, // 显示隐藏图片说明input
        images_upload_handler: imagesUploadHandler as any,
        // file_picker_callback,
        // convert_fonts_to_spans : false,// 转换字体元素为SPAN标签，默认为true
        // extended_valid_elements: "span",// 不允许使用的元素类型
      }}
      onEditorChange={handleEditorChange}
      {...rest}
    />
  );
};
export default TinyMceEditor;
