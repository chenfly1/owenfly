import { message } from 'antd';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { FC, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ProFormTextArea } from '@ant-design/pro-components';

interface VariableInputProps {
  value: string; // 输入框初始默认值
  label: string; // FormItem 标题
  name: string; // FormItem 参数名称
  textList: string[]; // 变量模版
  ref?: any;
  variableChange: (value: string) => void; // 输入框变化的回调函数
}

export const VARIABLE_REG = /\{\{(.*?)\}\}/g; // 正则匹配变量[X..]

const VariableInput: FC<VariableInputProps> = React.forwardRef(
  ({ value, label, name, textList, variableChange }, ref) => {
    const [inputValue, setInputValue] = useState<string>('');
    const inputRef = useRef<TextAreaRef>(null);
    const [variableArray, setVariableArray] = useState<string[]>([]);
    const [variableArrayList, setVariableArrayList] = useState<string[]>([]); // 明确的所有变量模版

    useEffect(() => {
      const variableArr = value.match(VARIABLE_REG) || [];
      setVariableArray(variableArr);
      setInputValue(value);
    }, [value]);

    useEffect(() => {
      const list = textList.map((item) => `{{${item}}}`);
      setVariableArrayList(list);
    }, [textList]);

    // 插入变量
    const insertVariable = (text: string) => {
      const textareaElement = inputRef?.current?.resizableTextArea?.textArea; // 获取textArea元素
      const cursorPosition = textareaElement?.selectionStart || 0; // 获取光标起始位置
      const previousText = inputValue.substr(0, cursorPosition); // 获取变量前文本
      const followingText = inputValue.substr(cursorPosition); // 获取变量后文本
      const initialValues = `${previousText}{{${text}}}${followingText}`;
      // 获取插入变量
      const variableArr = initialValues.match(VARIABLE_REG) || [];
      console.log(variableArr);
      const isCompliant = variableArr.every((itm) => variableArrayList.includes(itm));
      if (!isCompliant) {
        return message.error('不能对变量标志中进行插入变量！');
      }
      setInputValue(initialValues);
      setVariableArray(variableArr);
      variableChange?.(initialValues);

      // 插入操作完成后 将光标定位到插入内容的后面
      setTimeout(() => {
        inputRef?.current?.focus();
        textareaElement?.setSelectionRange(initialValues.length, initialValues.length);
      });
    };

    // 键盘输入
    const handleChangeInput = (e: any) => {
      const initialValues = e?.target?.value;
      console.log(initialValues);
      // 当前输入框内匹配的插入变量
      const variableArr = initialValues.match(VARIABLE_REG) || [];
      // 判断是否合规
      const isCompliant = variableArr.every((itm: string) => variableArrayList.includes(itm));
      if (!isCompliant) {
        return message.error('不能对变量标志中进行插入变量！');
      }
      // 判断是否手动删除变量，当前输入框内的变量数组与原变量数组对比，如果缺了就说明删除了一个变量
      const deleteVariable = variableArray.filter((itm: string) => !variableArr.includes(itm));
      console.log(deleteVariable);
      let deletedString = initialValues;
      if (deleteVariable.length > 0) {
        deletedString = inputValue.replace(deleteVariable[0], '');
      }
      setVariableArray(variableArr);
      setInputValue(deletedString);
      variableChange?.(deletedString);
    };

    useImperativeHandle(ref, () => {
      return {
        insertVariable,
      };
    });

    return (
      <React.Fragment>
        <ProFormTextArea
          label={label}
          name={name}
          placeholder="请输入消息内容"
          fieldProps={{
            ref: inputRef,
            rows: 4,
            onChange: handleChangeInput,
            value: inputValue,
          }}
        />
      </React.Fragment>
    );
  },
);

export default VariableInput;
