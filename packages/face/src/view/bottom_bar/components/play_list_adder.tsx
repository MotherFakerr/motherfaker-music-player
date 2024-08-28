import React from 'react';
import './play_list_adder.less';
import { inject, observer } from 'mobx-react';
import { Button, Card, Divider, Input, Modal, Segmented, Tabs, Upload, message } from 'antd';
import { IMusicStore } from '../../../store/music_store';
import { ILoadingStore } from '../../../store/loading_store';
import { MusicIndexDBHelper } from '../../../utils/indexdb_utils/music_indexdb_helper';
import TabPane from 'antd/es/tabs/TabPane';

interface IProps {
    musicStore: IMusicStore;
    loadingStore: ILoadingStore;
}

interface IState {
    isShow: boolean;
    inputUrl: string;
    tabKey: string;
}

const TAB_OPTIONS = ['URL 上传', '本地文件', 'AI 音乐'];
@inject('musicStore', 'loadingStore')
@observer
export class PlayListAdder extends React.Component<Partial<IProps>, IState> {
    private _isUploading = false;

    constructor(props: IProps) {
        super(props);
        this.state = {
            isShow: false,
            inputUrl: 'https://github.com/MotherFakerr/My-Suno-Collection',
            tabKey: TAB_OPTIONS[0],
        };
    }

    public render(): React.ReactElement {
        const { uploadLocalMusic, fetchAIMusics } = this.props.musicStore!;
        const { isShow } = this.state;
        return (
            <div className='play-list-adder' title='添加到播放列表'>
                <span className='icon-button iconfont icon-playlist-plus' aria-hidden onClick={() => this.setState({ isShow: true })} />
                <Modal
                    wrapClassName='play-list-adder-modal'
                    style={{ zIndex: 500 }}
                    styles={{
                        content: { backgroundColor: 'black', width: 500, padding: 24 },
                        body: {
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        },
                        mask: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                    }}
                    footer={null}
                    centered
                    open={isShow}
                    mask
                    maskClosable
                    closable={false}
                    onCancel={() => this.setState({ isShow: false })}>
                    <div className='title'>音乐上传面板</div>
                    <Segmented options={TAB_OPTIONS} onChange={(v) => this.setState({ tabKey: v })} block />
                    {this.state.tabKey === TAB_OPTIONS[0] && (
                        <Input.Search
                            value={this.state.inputUrl}
                            enterButton={<span className='iconfont icon-plus' aria-hidden color='rgb(54, 48, 48)' />}
                            placeholder='输入音乐URL'
                            onChange={(e) => this.setState({ inputUrl: e.target.value })}
                            onSearch={() => this._fetchMusicByUrl(this.state.inputUrl)}
                            style={{ borderRadius: 8 }}
                        />
                    )}
                    {this.state.tabKey === TAB_OPTIONS[1] && (
                        <Upload
                            accept='audio/*'
                            showUploadList={false}
                            fileList={[]}
                            customRequest={() => {
                                // do nothing
                            }}
                            onChange={async (info) => {
                                if (!this._ifCanAddPlayList()) {
                                    return;
                                }
                                if (this._isUploading) {
                                    return;
                                }

                                this._isUploading = true;
                                uploadLocalMusic(info.fileList.map((file) => file.originFileObj) as File[]).finally(async () => {
                                    this._isUploading = false;
                                });
                                console.log(info);
                                // pendingCount = 0;
                            }}>
                            <Button
                                type='primary'
                                icon={<span className='iconfont icon-upload' aria-hidden />}
                                block
                                style={{ width: '100%' }}>
                                选择文件
                            </Button>
                        </Upload>
                    )}
                    {this.state.tabKey === TAB_OPTIONS[2] && (
                        <Button
                            type='primary'
                            icon={<span className='iconfont icon-ai-music' aria-hidden />}
                            onClick={async () => {
                                fetchAIMusics();
                            }}
                            block>
                            获取 AI 音乐
                        </Button>
                    )}

                    {/* <div className='upload-container'>
                        <h2>输入音乐地址</h2>
                        <Input.Search
                            size='large'
                            value={this.state.inputUrl}
                            enterButton={<span className='iconfont icon-plus' aria-hidden />}
                            placeholder='请输入音乐地址'
                            onChange={(e) => this.setState({ inputUrl: e.target.value })}
                            onSearch={() => this._fetchMusicByUrl(this.state.inputUrl)}
                            style={{ borderRadius: 8 }}
                        />
                    </div>
                    <button
                        onClick={async () => {
                            fetchAIMusics();
                        }}></button>
                    <Divider style={{ borderBlockStartColor: '#fff' }}>或</Divider>
                    <div className='upload-container'>
                        <Upload.Dragger
                            multiple
                            showUploadList={false}
                            fileList={[]}
                            customRequest={() => {
                                // do nothing
                            }}
                            onChange={async (info) => {
                                if (!this._ifCanAddPlayList()) {
                                    return;
                                }
                                if (this._isUploading) {
                                    return;
                                }

                                this._isUploading = true;
                                uploadLocalMusic(info.fileList.map((file) => file.originFileObj) as File[]).finally(async () => {
                                    this._isUploading = false;
                                });
                                console.log(info);
                                // pendingCount = 0;
                            }}>
                            <span className='iconfont icon-music-circle' />
                            <p className='ant-upload-text'>点击或拖动文件到此区域进行上传</p>
                        </Upload.Dragger>
                    </div> */}
                </Modal>
            </div>
        );
    }

    private _ifCanAddPlayList(): boolean {
        if (!MusicIndexDBHelper.isOk) {
            message.warning('请先等待indexdb初始化完成');
            return false;
        }

        return true;
    }

    private _fetchMusicByUrl = async (url: string) => {
        const { fetchMusicByUrl } = this.props.musicStore!;
        await fetchMusicByUrl(url);

        this.setState({ inputUrl: '' });
    };
}
