import { Button, Checkbox, Form, Input } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "dva";
import React, { useEffect } from "react";
import { GlobalStateProps } from "src/common/interface";
import styles from "./Login.less";
import { useHistory } from "react-router-dom";
const { Item } = Form;

const Index = () => {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const user = useSelector((state: GlobalStateProps) => state.user);
  const { loading } = user;
  useEffect(() => {
    dispatch({
      type: "user/loginWithToken",
    })
  }, [])
  const onFinish = (values) => {
    dispatch({
      type: "user/login",
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
          rules={[{ required: true, message: "Please input your Password!" }, { min: 8}]}
          hasFeedback
        >
          <Input
            size="large"
            prefix={<LockOutlined className={styles.prefixIcon} />}
            type="password"
            placeholder="Enter the Password"
          />
        </Item>

        <Item>
          <Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Item>

          <Button className={styles.forgot} type="link">
            Forgot password
          </Button>
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
            SignIn
          </Button>
          Or <Button type="link" onClick={() => history.push("/user/register")} >register now!</Button>
        </Item>
      </Form>
      <div className={styles.center}>Example Credential: test@test.com - aaaaaaaa </div>
    </div>
  );
};

export default Index;
