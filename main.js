/**
 * 1. Render Songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 **/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "CUONGTK";
const playList = $(".playlist");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Thê Lương",
            singer: "Phúc Chinh",
            path: "./assets/music/1-TheLuong.mp3",
            image: "./assets/img/1-TheLuong.jpg",
        },
        {
            name: "Hoa Hải Đường",
            singer: "Jack",
            path: "./assets/music/2-HoaHaiDuong.mp3",
            image: "./assets/img/2-HoaHaiDuong.jpg",
        },
        {
            name: "Sài Gòn Đau Lòng Quá",
            singer: "Hứa Kim Tuyền - Hoàng Duyên",
            path: "./assets/music/3-SaiGonDauLongQua.mp3",
            image: "./assets/img/3-SaiGonDauLongQua.jpg",
        },
        {
            name: "Nàng Thơ",
            singer: "Hoàng Dũng",
            path: "./assets/music/4-NangTho.mp3",
            image: "./assets/img/4-NangTho.jpg",
        },
        {
            name: "Thê Lương 1",
            singer: "Phúc Chinh",
            path: "./assets/music/1-TheLuong.mp3",
            image: "./assets/img/1-TheLuong.jpg",
        },
        {
            name: "Hoa Hải Đường 1",
            singer: "Jack",
            path: "./assets/music/2-HoaHaiDuong.mp3",
            image: "./assets/img/2-HoaHaiDuong.jpg",
        },
        {
            name: "Sài Gòn Đau Lòng Quá 1",
            singer: "Hứa Kim Tuyền - Hoàng Duyên",
            path: "./assets/music/3-SaiGonDauLongQua.mp3",
            image: "./assets/img/3-SaiGonDauLongQua.jpg",
        },
        {
            name: "Nàng Thơ 1",
            singer: "Hoàng Dũng",
            path: "./assets/music/4-NangTho.mp3",
            image: "./assets/img/4-NangTho.jpg",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý lăng bài hát thu nhỏ đĩa quay và mờ đĩa quay
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý bấm nút play / pause
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };
        audio.onplay = function () {
            _this.isPlaying = true;
            cdThumbAnimate.play();
            player.classList.add("playing");
        };

        audio.onpause = function () {
            _this.isPlaying = false;
            cdThumbAnimate.pause();
            player.classList.remove("playing");
        };

        audio.ontimeupdate = function () {
            // console.log(audio.currentTime);
            const progressPercent = Math.floor(
                (audio.currentTime * 100) / audio.duration
            );
            if (audio.duration) {
                progress.value = progressPercent;
            }
        };

        progress.oninput = function (e) {
            const seek = (audio.duration * e.target.value) / 100;
            audio.currentTime = seek;
        };

        // Xử lý quay đĩa
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );

        cdThumbAnimate.pause();

        // Xử lý nút next qua bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Xử lý nút previous lùi lại bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                _this.nextSong();
            }
        };

        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)"); //closest: bấm vào bất ký vị trí nào trong thằng con thì cũng sẽ cho ra thằng có class ở vị trí .song

            if (songNode || e.target.closest(".option")) {
                // Xử lý khi click song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // Xử lý khi click vào song option
                if (e.target.closet(".option")) {
                }
            }
        };
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }, 300);
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        audio.play();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        audio.play();
    },

    definedproperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    playRandomSong: function () {
        const newIndex = Math.floor(Math.random() * this.songs.length);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        audio.play();
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
        });

        playList.innerHTML = htmls.join("");
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho Object
        this.definedproperties();

        // Load bài song đầu tiên
        this.loadCurrentSong();

        // Xử lý tất cả sự kiện
        this.handleEvents();

        // Xử lý cho ra tất dữ liệu bài hát
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
