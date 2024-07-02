/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { action, makeObservable, autorun, computed } from 'mobx';
import { AbstractStore } from './abstract_store';
import { registerStore } from '.';
import p5 from 'p5';
import { Player } from '@github-music-player/element';
import DEFAULT_ALBUM from '../assets/img/default_album.jpg';
declare module 'p5' {
    interface p5InstanceExtensions {
        clip(cb: () => p5): void;
    }
}
export interface IP5Store {
    containerId: string;
    init(): void;
}

@registerStore('p5Store')
export class P5Store extends AbstractStore implements IP5Store {
    containerId = 'p5-container';

    /** 所占空间比 */
    private _sizeCoefficient = 0.6;

    /** 唱片所占空间比 */
    private _discSizeCoefficient = 0.3;

    /** 唱片图片所占空间比 */
    private _discPicSizeCoefficient = 0.22;

    /** 唱片旋转速度 */
    private _rotateSpeed = 0.005;

    /** 唱片是否逆时针旋转 */
    private _rotateCCW = true;

    /** 背景渐变精度 */
    private _backgroundGradientPrecision = 40;

    constructor() {
        super();
        makeObservable(this, {
            init: action.bound,
        });
    }

    init(): void {
        const container = document.getElementById(this.containerId) as HTMLDivElement;
        if (!container) {
            throw new Error(`Container with id ${this.containerId} not found`);
        }
        let pic: p5.Image;
        let rotateAngle = 0;
        let center = new p5.Vector();
        let topColor: p5.Color;
        let bottomColor: p5.Color;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const maxLength = Math.min(width, height);
        const discDiameter = maxLength * this._discSizeCoefficient;
        const discRadius = discDiameter / 2;
        const discBorderWidth = 10;

        const discPicDiameter = maxLength * this._discPicSizeCoefficient;
        const discPicRadius = discPicDiameter / 2;

        const p5Object = new p5((p: p5) => {
            p.setup = () => {
                p.createCanvas(width, height);
                center = p.createVector(width / 2, height / 2);
            };
            p.preload = () => {
                pic = p.loadImage(DEFAULT_ALBUM);
            };
            p.draw = () => {
                p.noFill();
                p.noStroke();
                drawBackground(p);
                drawFrequency(p);
                drawDisc(p);
                drawDiscBorder(p);
                drawPic(p);
                drawNeedle(p);
            };
        }, container);

        autorun(() => {
            console.log(Player.getInstance().playingMusic);
            p5Object.loadImage(Player.getInstance().playingMusic?.picBlobUrl ?? DEFAULT_ALBUM, (img: p5.Image) => {
                pic = img;
                console.log(pic);
                pic.loadPixels();
                console.log(pic);
                // 获取唱片封面图片主色
                topColor = this._getAverageColor(p5Object, pic, 0, 0, pic.width, pic.height / 2);
                bottomColor = this._getAverageColor(p5Object, pic, 0, pic.height / 2, pic.width, pic.height / 2);
            });
        });

        const drawBackground = (p: p5) => {
            p.push();
            p.noStroke();
            for (let y = 0; y < this._backgroundGradientPrecision; y++) {
                const value = (y * height) / this._backgroundGradientPrecision;
                let inter = p.map(value, 0, height, 0, 1);
                let c = p.lerpColor(topColor, bottomColor, inter);
                p.fill(c);
                p.rect(0, value, width, height / this._backgroundGradientPrecision);
            }
            p.pop();
        };

        const drawDisc = (p: p5) => {
            p.push();
            p.translate(center.x, center.y);

            // 绘制基础唱片盘
            p.fill(30);
            p.circle(0, 0, discDiameter);
            p.noFill();

            // 添加同心圆纹路
            p.stroke(60);
            for (let i = 0; i < discDiameter; i += 10) {
                p.ellipse(0, 0, i, i);
            }
            p.pop();
        };

        const drawDiscBorder = (p: p5) => {
            p.push();
            p.noFill();
            p.translate(center.x, center.y);
            p.stroke(54);
            p.strokeWeight(discBorderWidth);
            p.ellipse(0, 0, discDiameter + discBorderWidth);

            p.stroke(67);
            p.strokeWeight(2);
            p.ellipse(0, 0, discDiameter + discBorderWidth * 2);

            for (let y = 0; y < 6; y++) {
                let inter = p.map(y, 0, 10, 0, 1);
                let c = p.lerpColor(p.color(19), p.color(30), inter);
                p.stroke(c);
                p.ellipse(0, 0, discDiameter - y);
            }

            p.pop();
        };

        const drawPic = (p: p5) => {
            p.push();
            p.translate(center.x, center.y);
            p.rotate(rotateAngle);
            p.fill(255);
            p.clip(() => p.circle(0, 0, discPicDiameter));
            p.image(pic, -discPicRadius, -discPicRadius, discPicDiameter, discPicDiameter);
            p.pop();
            if (Player.getInstance().status !== 'playing') {
                return;
            }
            if (this._rotateCCW) {
                rotateAngle -= this._rotateSpeed;
            } else {
                rotateAngle += this._rotateSpeed;
            }
        };
        const drawNeedle = (p: p5) => {
            p.push();
            p.translate(center.x, center.y - discRadius + (discRadius - discPicRadius) / 2);
            p.rotate(-0.15);

            p.stroke(200);
            p.strokeWeight(3);
            p.line(0, 0, 120, 0);
            p.fill(150);
            p.ellipse(0, 0, 20, 20);
            p.fill(100);
            p.ellipse(120, 0, 10, 10);

            p.pop();
        };

        const drawFrequency = (p: p5) => {
            p.push();
            const { frequencyData } = Player.getInstance();
            const unitHeight = ((maxLength * this._sizeCoefficient) / 2 - discRadius) / 256;
            const unitAngle = p.TWO_PI / frequencyData.length;
            p.beginShape();
            p.noFill();

            for (let i = 0; i < frequencyData.length; i++) {
                const inter = p.map(frequencyData[i], 0, 255, 0, 1);
                const c = p.lerpColor(p.color(0, 0, 255), p.color(0, 255, 0), inter);

                p.stroke(c);
                p.strokeWeight((2 * p.PI * discRadius) / frequencyData.length / 2);
                const value = frequencyData[i] * unitHeight + discRadius;
                const angle = i * unitAngle;
                const x = center.x - value * p.sin(angle);
                const y = center.y - value * p.cos(angle);
                p.line(center.x, center.y, x, y);
            }

            p.endShape();
            p.pop();
        };
    }

    private _getAverageColor(p5: p5, img: p5.Image, x: number, y: number, w: number, h: number) {
        let r = 0,
            g = 0,
            b = 0;
        let step = 20;
        let count = 0;

        for (let i = x; i < x + w; i += step) {
            for (let j = y; j < y + h; j += step) {
                let index = 4 * (i + j * img.width);
                if (!img.pixels[index] || !img.pixels[index + 1] || !img.pixels[index + 2]) {
                    continue;
                }
                r += img.pixels[index];
                g += img.pixels[index + 1];
                b += img.pixels[index + 2];
                count++;
            }
        }

        return p5.color((r / count) * 0.2, (g / count) * 0.2, (b / count) * 0.2);
    }
}
