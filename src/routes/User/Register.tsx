import { Button, Checkbox, Form, Input } from "antd";
import { UserOutlined, LockOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "dva";
import React from "react";
import { GlobalStateProps } from "src/common/interface";
import styles from "./Register.less";
import { useHistory } from "react-router-dom";
const { Item } = Form;

const Index = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const user = useSelector((state: GlobalStateProps) => state.user);
  const { loading } = user;

  const onFinish = (values) => {
    dispatch({
      type: "user/register",
      payload: values,
    });
  };

  const onFinishFailed = ({ errorFields }) => {
    form.scrollToField(errorFields[0].name);
  };

  return (
    <div className={styles.main}>
      <Form
        form={form}
        initialValues={{
          remember: false
        }}
        name="control-hooks"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Item
          name="email"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
          hasFeedback   
        >
          <Input
            size="large"
            prefix={<UserOutlined className={styles.prefixIcon} />}
            placeholder="Enter the Email"
          />
        </Item>

        <Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }, { min: 6}]}
          hasFeedback
        >
          <Input
            size="large"
            prefix={<LockOutlined className={styles.prefixIcon} />}
            type="password"
            placeholder="Enter the Password"
          />
        </Item>

        <Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input
            size="large"
            prefix={<CheckOutlined className={styles.prefixIcon} />}
            type="password"
            placeholder="Confirm Password"
          />
        </Item>

        <Item>
          {}
          <Button
            htmlType="submit"
            className={styles.submit}
            size="large"
            loading={loading}
            type="primary"
          >
            Register
          </Button>
          Or <Button type="link" onClick={() => history.push("/user/login")}>sign in now!</Button>
        </Item>
      </Form>
    </div>
  );
};

export default Index;
