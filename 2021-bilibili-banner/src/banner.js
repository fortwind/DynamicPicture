class Banner extends HTMLDivElement {
    constructor() {
        super();
        this.$banner = null;
        this.$layersChildren = null;
        this.$video = null;
        this.$canvas = null;
        this.snow = null;
        this.attributesData = null;
        this.onMouseOver = null;
        this.onMouseLeave = null;

        this.init();
    }

    init() {
        const $root = document.querySelector('#bilibili-banner');
        const $content = $root.content.cloneNode(true);
        this.$banner = $content.querySelector('.animated-banner');
        this.$layersChildren = Array.prototype.map.call(this.$banner.querySelectorAll('.layer'), v => v.children[0]);
        this.$canvas = $content.querySelector('#canvas');

        this.mntChild($content);
    }

    mntChild($content) {
        const $shadow = this.attachShadow({ mode: 'closed' });
        $shadow.appendChild($content);

        // 不使用 shadow dom
        // this.appendChild(content);
    }

    connectedCallback() {
        this.initAttrData();
        this.initDomAttr();
        this.snow = this.snowFly(this.$banner);
        this.animatedBanner(this.$banner);
    }

    disconnectCallback() {
        if(this.onMouseOver) {
            $banner.removeEventListener('mouseover', this.onMouseOver.bind(this));
        }
        if(this.onMouseLeave) {
            $banner.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
        }
    }

    initAttrData() {
        this.attributesData = window.banner.dataAttr.map(v => ({...v}));
    }

    initDomAttr() {
        this.attributesData.forEach((attr, i) => {
            if (attr.type === 'img') {
                this.$layersChildren[i].src = attr.src;
            } else if (attr.type === 'video') {
                this.$video = this.$layersChildren[i];
                this.setVideoSrc(this.$video, attr.src);
            }
            this.setNodeAttr(this.$layersChildren[i], attr);
        });
    }

    setNodeAttr($node, { translateX, blur, opacity, inherentTransform }) {
        $node.style.filter = `blur(${blur}px)`;
        $node.style.transform = `${inherentTransform} translateX(${translateX}px)`;
        $node.style.opacity = opacity;
    }

    setVideoSrc($video, src) {
        fetch(src).then(response => {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Network error');
        }).then(blob => {
            $video.src = URL.createObjectURL(blob);
        });
    }

    animatedBanner($banner) {
        const ns = { dist: 0 };
        const updateAttrHandlers = this.updateAttr(this.attributesData, ns); // 传递引用即时更新 dist

        let initialPosX = 0,
            updated = true,
            distPerFrame = 0;

        const updateAttributes = () => {
            updateAttrHandlers.forEach(v => v());
            updated = true;
        };

        // 控制每一帧更新一次属性
        const onMouseMove = ({ clientX }) => {
            if(updated) {
                ns.dist = clientX - initialPosX;
                updated = false;
                requestAnimationFrame(updateAttributes);
            }
        };

        const onMouseOver = ({ clientX }) => {
            updated = true;
            initialPosX = clientX;
            ns.dist = 0;

            this.$video.play();
            $banner.addEventListener('mousemove', onMouseMove);
        };

        const resetDomAttr = () => {
            if(ns.dist === 0) {
                updated = false;
                return;
            }
            ns.dist -= distPerFrame;
            if (Math.abs(ns.dist) < 5) {
                ns.dist = 0;
            }
            updateAttributes();
            requestAnimationFrame(resetDomAttr);
        };

        const onMouseLeave = () => {
            $banner.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(updateAttributes);

            resetDomAttr(distPerFrame = ns.dist / 12); // 分为12次复归原位
            this.$video.pause();

            initialPosX = 0;
        }

        this.onMouseOver = onMouseOver;
        this.onMouseLeave = onMouseLeave;

        $banner.addEventListener('mouseover', onMouseOver);
        $banner.addEventListener('mouseleave', onMouseLeave);
    }

    updateAttr(attributes, ns) {
        const updateAttrHandlers = new Array(attributes.length);
        const cloneAttr = attributes.map(
            ({ translateX, opacity, blur, inherentTransform }, index) =>
                new Proxy({ translateX, opacity, blur, inherentTransform, index }, {
                    set(target, p, value, receiver) {
                        if (p === 'translateX') {
                            // target[p] = value < -40 ? -40 : value > 40 ? 40 : value;
                            target[p] = value;
                        } else if (p === 'opacity') {
                            target[p] = value < 0 ? 0 : value > 1 ? 1 : value;
                            // target[p] = value;
                        } else if (p === 'blur') {
                            target[p] = value < 0 ? 0 : value;
                        }
                        return true;
                    }
                }));

        attributes.forEach(({ translateX, opacity, blur }, i) => {
            switch (i) {
                case 0:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity - ns.dist / 500;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 1:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity - Math.abs(ns.dist) / 500;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 2:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].opacity = opacity - Math.abs(ns.dist) / 800;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 3:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity + ns.dist / 500;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 4:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity + ns.dist / 500;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 5:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity - ns.dist / 500;
                        // cloneAttr[i].blur = blur + ns.dist / 100;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 6:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity - Math.abs(ns.dist) / 500;
                        // cloneAttr[i].blur = blur - Math.abs(ns.dist) / 100;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                case 7:
                    updateAttrHandlers[i] = () => {
                        cloneAttr[i].translateX = translateX - ns.dist / 20;
                        cloneAttr[i].opacity = opacity + ns.dist / 500;
                        // cloneAttr[i].blur = blur - ns.dist / 100;
                        this.setNodeAttr(this.$layersChildren[i], cloneAttr[i]);
                    };
                    break;
                default:
                    break;
            }
        });

        let prevPosX = ns.dist;
        updateAttrHandlers.push(() => {
            this.snow.setOffsetX((prevPosX - ns.dist) / 5);
            prevPosX = ns.dist;
        });

        return updateAttrHandlers;
    }

    snowFly() {
        return new SnowFall({ maxFlake: 48, fallSpeed: 0.5, flakeSize: 5, canvas: this.$canvas }).init();
    }
}
window.customElements.define('bilibili-banner', Banner, {extends: 'div'});
// https://www.zsxcool.com/6257.html
