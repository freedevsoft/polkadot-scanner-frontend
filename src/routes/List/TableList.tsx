import { Button, Card, Space, Input, Form, Table, message, Row, Col, Tooltip, Progress } from "antd";
import { SearchOutlined, ReloadOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import Highlighter from 'react-highlight-words';
import { ApiPromise, WsProvider } from '@polkadot/api';
import styles from './TableList.less';

export default () => {
  const [data, setData] = useState([]);
  const [api, setApi] = useState<any>();
  const [form] = Form.useForm()
  const [searchInput, setSearchInput] = useState<any>();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [loadingLastBlock, setLoadingLastBlock] = useState(false);
  const [percent, setPercent] = useState(0);
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            setSearchInput(node);
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });
  const getColumnSortProps = dataIndex => ({
    sorter: (a, b) => {
      if(a[dataIndex] < b[dataIndex]) { return -1; }
      if(a[dataIndex] > b[dataIndex]) { return 1; }
      return 0;
    }
  })
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const columns = [
    {
      title: "Block Number",
      dataIndex: "blockNumber",
      key: "blockNumber",
      ...getColumnSortProps('blockNumber')
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      ...getColumnSearchProps('eventName'),
      ...getColumnSortProps('eventName')
    },
    {
      title: "Event Description",
      dataIndex: "eventDoc",
      key: "eventDoc",
      ...getColumnSortProps('eventDoc')
    },
    {
      title: "Event Data",
      dataIndex: "eventData",
      key: "eventData",
      render: data => 
        Object.values(data).map((value, index) => {
          return(
            Object.entries(value).map((entry, subIndex) => {
              const [key, value] = entry;
              return(
                <div key={`${index}-${subIndex}`} className={styles.event_data_cell}>
                  <span>{key}</span>
                  {key !== "DispatchInfo" ?
                    <span>{value}</span> :
                    <span>{JSON.stringify(value)}</span>
                  }
                </div>
              )
            })
          )
        })
    },
  ];
  const onFinishFailed = ( error ) => {
    message.error('Submit failed!');
  };
  
  const onFinish = async () => {
    setData([]);
    const endBlockNumber = form.getFieldValue('endBlock');
    const startBlockNumber = form.getFieldValue('startBlock');
    const startBlockHash = await api.rpc.chain.getBlockHash(startBlockNumber);
    if(startBlockNumber > endBlockNumber) 
      return message.error('Please enter the Start Blcok Number correctly!')
    if(startBlockHash.toHex() === '0x0000000000000000000000000000000000000000000000000000000000000000')
      return message.error('Start Block Number is not Exist');
    const endBlockHash = await api.rpc.chain.getBlockHash(endBlockNumber);
    if(endBlockHash.toHex() === '0x0000000000000000000000000000000000000000000000000000000000000000')
      return message.error('End Block Number is not Exist');
    const delta = 100 / (parseInt(endBlockNumber) - parseInt(startBlockNumber) + 1);
    setPercent(0);
    let totalCount = 0
    for(let i = parseInt(endBlockNumber); i >= parseInt(startBlockNumber); i --)
    {
      const blockHash = await api.rpc.chain.getBlockHash(`${i}`);
      const signedBlock = await api.rpc.chain.getBlock(blockHash);
      const allRecords = await api.query.system.events.at(signedBlock.block.header.hash);

      // map events
      const events = allRecords.map(({ event }, key) => {
        const types = event.typeDef;
        return {
          key: `${i}-${key}`,
          eventName: `${event.section}.${event.method}`,
          blockNumber: `${i}`,
          eventDoc: event.meta.docs.join().replace(/\\/g, ""),
          eventData: {...event.data.map((data, index) => {
            return {[types[index].type]: types[index].type === "DispatchInfo" ? JSON.parse(data.toString()): data.toString()};
          })}
        }
        
      });
      totalCount += events.length;
      setData( values => values.concat(events));
      setPercent( value =>  (value + delta) > 100 ? 100 : (Math.round(value + delta)));
    }
    message.success(`${totalCount} events have been loaded!`);
  };
  const initApi = async (endpoint) => {
    setLoadingLastBlock(true);
    const wsProvider = new WsProvider(endpoint || 'wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    const header = await api.rpc.chain.getHeader();
    form.setFieldsValue({endBlock: header.number.toString()})
    setLoadingLastBlock(false);
    setApi(api);
  }
  useMemo(() => {
    initApi(form.getFieldValue('endPoint')).catch(console.error)
  }, []);
  const getLastBlock = async () => {
    setLoadingLastBlock(true);
    if(api)
      {
        const header = await api.rpc.chain.getHeader();
        form.setFieldsValue({endBlock: header.number.toString()})
      }
    setLoadingLastBlock(false);
  }
  return (
    <Card bordered={false}>
      <Form
        form={form}
        initialValues={{ endPoint:'wss://rpc.polkadot.io', startBlock: '', endBlock: '' }}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="startBlock"
              label="Start Block"
              rules={[
                {
                  required: true,
                  message: 'Please input Start Block!',
                },
                {
                  type: 'string',
                  min: 7,
                },
              ]}
              hasFeedback
            >
              <Input size="large" placeholder="Input Start Block" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endBlock"
              label="End Block"
              rules={[
                {
                  required: true,
                },
                {
                  type: 'string',
                  min: 7,
                },
              ]}
              hasFeedback
            >
              <Input 
                size="large"
                placeholder="Input End Block"
                allowClear
                suffix={
                  <Tooltip title="Reload the latest Block Number">
                    <Button size="small" onClick={getLastBlock} shape="circle" icon={ loadingLastBlock ? <LoadingOutlined /> : <ReloadOutlined />} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="endPoint"
              label="End Point"
              rules={[
                {
                  required: true,
                },
                {
                  type: 'string',
                  min: 6,
                },
              ]}
              hasFeedback
            >
              <Input size="large" placeholder="Input End Point" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit" >
              Scan
            </Button>
          </Space>
        </Form.Item>
        <Progress percent={percent} />
      </Form>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        loading={!data}
      />
    </Card>
  );
};
