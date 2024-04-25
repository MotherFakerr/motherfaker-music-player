import React from 'react';
import './play_list_adder.less';
import { inject, observer } from 'mobx-react';
import { Divider, Input, Modal, Upload, message } from 'antd';
import { IMusicStore } from '../../../store/music_store';
import { ILoadingStore } from '../../../store/loading_store';
import { LoadingHelper } from '../../../utils/loading_helper';
import { MusicIndexDBHelper } from '../../../utils/music_indexdb_helper';
import { sleep } from '../../../utils/common_util';

interface IProps {
    musicStore: IMusicStore;
    loadingStore: ILoadingStore;
}

interface IState {
    isShow: boolean;
    inputUrl: string;
}

@inject('musicStore', 'loadingStore')
@observer
export class PlayListAdder extends React.Component<Partial<IProps>, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isShow: false,
            inputUrl: '',
        };
    }

    public render(): React.ReactElement {
        const { uploadLocalMusic } = this.props.musicStore!;
        const { isShow } = this.state;
        let fileCount = 0;
        let pendingCount = 0;
        return (
            <div className='play-list-adder'>
                <span className='icon-button iconfont icon-playlist-plus' aria-hidden onClick={() => this.setState({ isShow: true })} />
                <Modal
                    className='play-list-adder-modal'
                    style={{ zIndex: 500 }}
                    styles={{
                        content: { backgroundColor: '#333', height: 500 },
                        body: {
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        },
                    }}
                    footer={null}
                    centered
                    open={isShow}
                    mask
                    maskClosable
                    closable={false}
                    onCancel={() => this.setState({ isShow: false })}>
                    <div className='upload-container'>
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
                    <Divider style={{ borderBlockStartColor: '#fff' }}>或</Divider>
                    <div className='upload-container'>
                        <Upload.Dragger
                            multiple
                            showUploadList={false}
                            fileList={[]}
                            customRequest={async (e) => {
                                if (this._ifCanAddPlayList()) {
                                    await sleep(500);
                                    uploadLocalMusic([e.file as File]).finally(async () => {
                                        pendingCount++;
                                        LoadingHelper.setLoadingProgress(pendingCount / fileCount);
                                        LoadingHelper.setLoadingMessage((e.file as File).name);
                                        await sleep(500);
                                        if (pendingCount === fileCount) {
                                            LoadingHelper.setLoading(false);
                                        }
                                    });
                                }
                            }}
                            onChange={(info) => {
                                LoadingHelper.setLoading(true);
                                fileCount = info.fileList.length;
                                pendingCount = 0;
                            }}>
                            <span className='iconfont icon-music-circle' />
                            <p className='ant-upload-text'>点击或拖动文件到此区域进行上传</p>
                        </Upload.Dragger>
                    </div>
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
        LoadingHelper.setLoading(true);
        LoadingHelper.setLoadingMessage('正在拉取音乐中');
        await sleep(500);
        const { fetchMusicByUrl } = this.props.musicStore!;
        await fetchMusicByUrl(url);
        LoadingHelper.setLoading(false);
        this.setState({ inputUrl: '' });
    };
}
