// ==UserScript==
// @name            manga comic downloader
// @name:vi         manga comic downloader
// @namespace       https://baivong.github.io
// @description     Tải truyện tranh từ các trang chia sẻ ở Việt Nam. Nhấn Alt+Y để tải toàn bộ.
// @description:vi  Tải truyện tranh từ các trang chia sẻ ở Việt Nam. Nhấn Alt+Y để tải toàn bộ.
// @version         2.1.1
// @icon            https://i.imgur.com/ICearPQ.png
// @author          Zzbaivong
// @license         MIT; https://baivong.mit-license.org/license.txt
// @match           http://*.truyentranhtam.com/*
// @match           http://*.truyentranh8.org/*
// @match           http://*.truyentranh8.com/*
// @match           http://*.truyentranh869.com/*
// @match           http://*.truyentranh86.com/*
// @match           http://iutruyentranh.com/*
// @match           https://iutruyentranh.com/*
// @match           https://*.truyentranh.net/*
// @match           https://comicvn.net/*
// @match           https://beeng.net/*
// @match           https://*.hamtruyen.com/*
// @match           https://ntruyen.info/*
// @match           https://*.a3manga.com/*
// @match           http://truyentranhtuan.com/*
// @match           http://mangak.info/*
// @match           https://truyentranhlh.net/*
// @match           https://truyentranhlh.com/*
// @match           https://hocvientruyentranh.net/*
// @match           https://hocvientruyentranh.com/*
// @match           https://truyenhay24h.com/*
// @match           http://truyen1.net/*
// @match           http://*.hentailxx.com/*
// @match           https://*.hentailxx.com/*
// @match           https://hentaivn.net/*
// @match           https://otakusan.net/*
// @match           https://ngonphongcomics.com/*
// @match           http://*.nettruyen.com/*
// @match           http://*.hamtruyentranh.net/*
// @match           https://ttmanga.com/*
// @match           http://truyen.vnsharing.site/*
// @match           https://blogtruyen.com/*
// @match           https://blogtruyen.vn/*
// @match           https://blogtruyen.top/*
// @match           https://truyensieuhay.com/*
// @match           http://truyenchon.com/*
// @match           http://truyenqq.com/*
// @match           https://sachvui.com/*
// @match           https://hentaicube.net/*
// @require         https://code.jquery.com/jquery-3.4.1.min.js
// @require         https://unpkg.com/jszip@3.2.1/dist/jszip.min.js
// @require         https://unpkg.com/file-saver@2.0.1/dist/FileSaver.min.js
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @require         https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js
// @noframes
// @connect         *
// @supportURL      https://github.com/lelinhtinh/Userscript/issues
// @run-at          document-start
// @grant           GM_addStyle
// @grant           GM_xmlhttpRequest
// @grant           GM.xmlHttpRequest
// @grant           GM_registerMenuCommand
// ==/UserScript==

window._URL = window.URL || window.webkitURL;

jQuery(function ($) {
  /**
   * Output extension
   * @type {String} zip
   *                cbz
   *
   * Tips: Convert .zip to .cbz
   * Windows
   * $ ren *.zip *.cbz
   * Linux
   * $ rename 's/\.zip$/\.cbz/' *.zip
   */
  var outputExt = 'cbz'; // or 'zip'

  /**
   * Multithreading
   * @type {Number} [1 -> 32]
   */
  var threading = 8;

  /**
   * Image list will be ignored
   * @type {Array} url
   */
  var ignoreList = [
    'http://truyentranhtam.net/templates/main/images/gioithieubanbe3.png',
    'http://1.bp.blogspot.com/-U1SdU4_52Xs/WvLvn1OjvHI/AAAAAAAEugM/dLBgVGSeUN0bVy-FoFfIZvrCJ07YQew7wCHMYCw/s0/haybaoloi.png',
    '/public/images/loading.gif',
    'http://truyentranhlh.net/wp-content/uploads/2015/10/lhmanga.png',
    '/Content/Img/1eeef5d2-b936-496d-ba41-df1b21d0166a.jpg',
    '/Content/Img/d79886b3-3699-47b2-bbf4-af6149c2e8fb.jpg',
    'http://st.beeng.net/files/uploads/images/21/c8/21c8d2c3599c485e31f270675bc57e4c.jpeg',
  ];

  /**
   * Keep the original url
   * @type {Array} key
   */
  var keepOriginal = [
    'proxy.truyen.cloud',
    '.ttmanga.com',
    '.fbcdn.net',
    'mangaqq.net',
    'mangaqq.com',
    '.upanhmoi.net',
    'qqtaku.com',
    'qqtaku.net',
    'trangshop.net',
    '.beeng.net',
  ];

  /**
   * HTTP referer
   * @param {Object} hostname
   */
  var referer = {
    'i.blogtruyen.com': 'https://blogtruyen.com',
    'truyen.cloud': 'http://www.nettruyen.com',
    'proxy.truyen.cloud': 'http://www.nettruyen.com',
    'upload.upanhmoi.net': 'https://upanhmoi.net',
    'upload2.upanhmoi.net': 'https://upanhmoi.net',
    'upload3.upanhmoi.net': 'https://upanhmoi.net',
    'img1.upanhmoi.net': 'https://upanhmoi.net',
    'img2.upanhmoi.net': 'https://upanhmoi.net',
    'proxy1.ttmanga.com': 'https://ttmanga.com',
    'proxy2.ttmanga.com': 'https://ttmanga.com',
    'proxy3.ttmanga.com': 'https://ttmanga.com',
    'cdn.lhmanga.com': 'https://truyentranhlh.net',
    'cdn1.lhmanga.com': 'https://truyentranhlh.net',
    'storage.fshare.vn': 'https://truyentranh.net',
    'ocumeo.com': 'https://www.a3manga.com/',
    'www.ocumeo.com': 'https://www.a3manga.com/',
  };

  /* === DO NOT CHANGE === */

  window.URL = window._URL;

  function isEmpty(el) {
    return !$.trim(el.html());
  }

  function getImageType(arrayBuffer) {
    if (!arrayBuffer.byteLength)
      return {
        mime: null,
        ext: null,
      };

    var ext = '',
      mime = '',
      dv = new DataView(arrayBuffer, 0, 5),
      numE1 = dv.getUint8(0, true),
      numE2 = dv.getUint8(1, true),
      hex = numE1.toString(16) + numE2.toString(16);

    switch (hex) {
      case '8950':
        ext = 'png';
        mime = 'image/png';
        break;
      case '4749':
        ext = 'gif';
        mime = 'image/gif';
        break;
      case 'ffd8':
        ext = 'jpg';
        mime = 'image/jpeg';
        break;
      case '424d':
        ext = 'bmp';
        mime = 'image/bmp';
        break;
      case '5249':
        ext = 'webp';
        mime = 'image/webp';
        break;
      default:
        ext = null;
        mime = null;
        break;
    }

    return {
      mime: mime,
      ext: ext,
    };
  }

  function noty(txt, status) {
    function destroy() {
      if (!$noty.length) return;
      $noty.fadeOut(300, function () {
        $noty.remove();
        $noty = [];
      });
      clearTimeout(notyTimeout);
    }

    function autoHide() {
      notyTimeout = setTimeout(function () {
        destroy();
      }, 2000);
    }

    if (!$noty.length) {
      var $wrap = $('<div>', {
          id: 'baivong_noty_wrap',
        }),
        $content = $('<div>', {
          id: 'baivong_noty_content',
          class: 'baivong_' + status,
          html: txt,
        }),
        $close = $('<div>', {
          id: 'baivong_noty_close',
          html: '&times;',
        });

      $noty = $wrap.append($content).append($close);
      $noty.appendTo('body').fadeIn(300);
    } else {
      $noty
        .find('#baivong_noty_content')
        .attr('class', 'baivong_' + status)
        .html(txt);

      $noty.show();
      clearTimeout(notyTimeout);
    }

    $noty
      .click(function () {
        destroy();
      })
      .hover(
        function () {
          clearTimeout(notyTimeout);
        },
        function () {
          autoHide();
        }
      );
    if (status !== 'warning' && status !== 'success') autoHide();
  }

  function linkError() {
    $(configs.link + '[href="' + configs.href + '"]')
      .css({
        color: 'red',
        textShadow: '0 0 1px red, 0 0 1px red, 0 0 1px red',
      })
      .data('hasDownloadError', true);
  }

  function linkSuccess() {
    var $currLink = $(configs.link + '[href="' + configs.href + '"]');
    if (!$currLink.data('hasDownloadError'))
      $currLink.css({
        color: 'green',
        textShadow: '0 0 1px green, 0 0 1px green, 0 0 1px green',
      });
  }

  function cancelProgress() {
    linkError();
    $win.off('beforeunload');
  }

  function notyError() {
    noty('Lỗi! Không tải được <strong>' + chapName + '</strong>', 'error');
    inProgress = false;
    cancelProgress();
  }

  function notyImages() {
    noty('Lỗi! <strong>' + chapName + '</strong> không có dữ liệu', 'error');
    inProgress = false;
    cancelProgress();
  }

  function notySuccess(source) {
    if (threading < 1) threading = 1;
    if (threading > 32) threading = 32;

    dlImages = source;
    dlTotal = dlImages.length;
    addZip();

    noty('Bắt đầu tải <strong>' + chapName + '</strong>', 'warning');

    $win.on('beforeunload', function () {
      return 'Progress is running...';
    });
  }

  function notyWait() {
    document.title = '[…] ' + tit;

    noty('<strong>' + chapName + '</strong> đang lấy dữ liệu...', 'warning');

    dlAll = dlAll.filter(function (l) {
      return configs.href.indexOf(l) === -1;
    });

    $(configs.link + '[href="' + configs.href + '"]').css({
      color: 'orange',
      fontWeight: 'bold',
      fontStyle: 'italic',
      textDecoration: 'underline',
      textShadow: '0 0 1px orange, 0 0 1px orange, 0 0 1px orange',
    });
  }

  function dlAllGen() {
    dlAll = [];
    $(configs.link).each(function (i, el) {
      dlAll[i] = $(el).attr('href');
    });
    if (configs.reverse) dlAll.reverse();
  }

  function notyReady() {
    noty('Script đã <strong>sẵn sàng</strong> làm việc', 'info');

    dlAllGen();

    $doc
      .on('click', configs.link, function (e) {
        if (!e.ctrlKey && !e.shiftKey) return;

        e.preventDefault();
        var _link = $(this).attr('href');

        if (e.ctrlKey && e.shiftKey) {
          dlAll = dlAll.filter(function (l) {
            return _link.indexOf(l) === -1;
          });

          $(configs.link + '[href="' + _link + '"]').css({
            color: 'gray',
            fontWeight: 'bold',
            fontStyle: 'italic',
            textDecoration: 'line-through',
            textShadow: '0 0 1px gray, 0 0 1px gray, 0 0 1px gray',
          });
        } else {
          if (!inCustom) {
            dlAll = [];
            inCustom = true;
          }

          dlAll.push(_link);

          $(configs.link + '[href="' + _link + '"]').css({
            color: 'violet',
            textDecoration: 'overline',
            textShadow: '0 0 1px violet, 0 0 1px violet, 0 0 1px violet',
          });
        }
      })
      .on('keyup', function (e) {
        if (e.which === 17 || e.which === 16) {
          e.preventDefault();

          if (dlAll.length && inCustom) {
            if (e.which === 16) inMerge = true;
            downloadAll();
          }
        }
      });
  }

  function downloadAll() {
    if (inProgress || inAuto) return;
    if (!inCustom && !dlAll.length) dlAllGen();
    if (!dlAll.length) return;
    inAuto = true;
    $(configs.link + '[href*="' + dlAll[0] + '"]').trigger('contextmenu');
  }

  function downloadAllOne() {
    inMerge = true;
    downloadAll();
  }

  function genFileName() {
    return chapName.replace(/\s+/g, '_').replace(/\./g, '-');
  }

  function endZip() {
    if (!inMerge) {
      dlZip = new JSZip();
      dlPrevZip = false;
    }
    dlCurrent = 0;
    dlFinal = 0;
    dlTotal = 0;
    dlImages = [];

    inProgress = false;

    if (inAuto) {
      if (dlAll.length) {
        $(configs.link + '[href*="' + dlAll[0] + '"]').trigger('contextmenu');
      } else {
        inAuto = false;
        inCustom = false;
      }
    }
  }

  function genZip() {
    noty('Đang tạo file nén của <strong>' + chapName + '</strong>', 'warning');

    dlZip
      .generateAsync({
        type: 'blob',
      })
      .then(
        function (blob) {
          var zipName = genFileName() + '.' + outputExt;

          if (dlPrevZip) URL.revokeObjectURL(dlPrevZip);
          dlPrevZip = blob;

          noty(
            '<a href="' +
              URL.createObjectURL(dlPrevZip) +
              '" download="' +
              zipName +
              '"><strong>Click vào đây</strong></a> nếu trình duyệt không tự tải xuống',
            'success'
          );
          linkSuccess();

          $win.off('beforeunload');
          saveAs(blob, zipName);

          document.title = '[⇓] ' + tit;
          endZip();
        },
        function () {
          noty('Lỗi tạo file nén của <strong>' + chapName + '</strong>', 'error');
          cancelProgress();

          document.title = '[x] ' + tit;
          endZip();
        }
      );
  }

  function dlImg(url, success, error) {
    var filename = ('0000' + dlCurrent).slice(-4),
      urlObj = new URL(url),
      urlHost = urlObj.hostname,
      headers = {};

    if (referer[urlHost]) {
      headers.referer = referer[urlHost];
      headers.origin = referer[urlHost];
    }
    if (url.indexOf('otakusan.net') !== -1) headers['page-lang'] = 'vn-lang';

    GM.xmlHttpRequest({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: headers,
      onload: function (response) {
        var imgExt = getImageType(response.response).ext;
        dlFinal++;
        if (imgExt === 'gif') {
          next();
          return;
        }

        if (
          !imgExt ||
          response.response.byteLength < 300 ||
          (response.statusText !== 'OK' && response.statusText !== '')
        ) {
          error(response, filename);
        } else {
          filename = filename + '.' + imgExt;
          success(response, filename);
        }
      },
      onerror: function (err) {
        dlFinal++;
        error(err, filename);
      },
    });
  }

  function next() {
    noty('<strong class="centered">' + dlFinal + '/' + dlTotal + '</strong>', 'warning');

    if (dlFinal < dlCurrent) return;

    if (dlFinal < dlTotal) {
      addZip();
    } else {
      if (inMerge) {
        if (dlAll.length) {
          linkSuccess();
          endZip();
        } else {
          inMerge = false;
          genZip();
        }
      } else {
        genZip();
      }
    }
  }

  function addZip() {
    var max = dlCurrent + threading,
      path = '';

    if (max > dlTotal) max = dlTotal;
    if (inMerge) path = genFileName() + '/';

    for (dlCurrent; dlCurrent < max; dlCurrent++) {
      dlImg(
        dlImages[dlCurrent],
        function (response, filename) {
          dlZip.file(path + filename, response.response);

          next();
        },
        function (err, filename) {
          dlZip.file(path + filename + '_error.txt', err.statusText + '\r\n' + err.finalUrl);

          noty(err.statusText, 'error');
          linkError();

          next();
        }
      );
    }
  }

  function imageIgnore(url) {
    return ignoreList.indexOf(url) !== -1;
  }

  function protocolUrl(url) {
    if (url.indexOf('//') === 0) url = location.protocol + url;
    if (url.search(/https?:\/\//) !== 0) url = 'http://' + url;
    return url;
  }

  function redirectSSL(url) {
    if (
      url.search(/(i\.imgur\.com|\.blogspot\.com|\.fbcdn\.net|storage\.fshare\.vn)/i) !== -1 &&
      url.indexOf('http://') === 0
    )
      url = url.replace(/^http:\/\//, 'https://');

    return url;
  }

  function decodeUrl(url) {
    var parser = new DOMParser(),
      dom = parser.parseFromString('<!doctype html><body>' + url, 'text/html');

    return decodeURIComponent(dom.body.textContent);
  }

  function imageFilter(url) {
    var keep = keepOriginal.some(function (key) {
      return url.indexOf(key) !== -1;
    });
    if (keep) return protocolUrl(url);

    url = decodeUrl(url);
    url = url.trim();
    url = url.replace(/^.+(&|\?)url=/, '');
    url = url.replace(/(https?:\/\/)lh(\d)(\.bp\.blogspot\.com)/, '$1$2$3');
    url = url.replace(/(https?:\/\/)lh\d\.(googleusercontent|ggpht)\.com/, '$14.bp.blogspot.com');
    url = url.replace(/\?.+$/, '');
    if (url.indexOf('imgur.com') !== -1) {
      url = url.replace(/(\/)(\w{5}|\w{7})(s|b|t|m|l|h)(\.(jpe?g|png|webp))$/, '$1$2$4');
    } else if (url.indexOf('blogspot.com') !== -1) {
      url = url.replace(/\/([^/]+-)?(Ic42)(-[^/]+)?\//, '/$2/');
      url = url.replace(/\/(((s|w|h)\d+|(w|h)\d+-(w|h)\d+))?-?(c|d|g)?\/(?=[^/]+$)/, '/');
      url += '?imgmax=16383';
    } else {
      url = url.replace(/(\?|&).+/, '');
    }
    url = encodeURI(url);
    url = protocolUrl(url);
    url = redirectSSL(url);

    return url;
  }

  function checkImages(images) {
    var source = [];

    if (!images.length) {
      notyImages();
    } else {
      $.each(images, function (i, v) {
        if (imageIgnore(v) || typeof v === 'undefined') return;
        if (/[><"']/.test(v)) return;

        if (
          (v.indexOf(location.origin) === 0 || (v.indexOf('/') === 0 && v.indexOf('//') !== 0)) &&
          !/^(\.(jpg|png)|webp|jpeg)$/.test(v.slice(-4))
        ) {
          return;
        } else if (v.indexOf('http') !== 0 && v.indexOf('//') !== 0) {
          v = location.origin + (v.indexOf('/') === 0 ? '' : '/') + v;
        } else if (v.indexOf('http') === 0 || v.indexOf('//') === 0) {
          v = imageFilter(v);
        } else {
          return;
        }

        source.push(v);
      });

      notySuccess(source);
    }
  }

  function getImages($contents) {
    var images = [];
    $contents.each(function (i, v) {
      var $img = $(v);
      images[i] = $img.data('cdn') || $img.data('src') || $img.data('original');
    });

    checkImages(images);
  }

  function getContents($source) {
    var method = 'find';
    if (configs.filter) method = 'filter';

    var $entry = $source[method](configs.contents).find('img');
    if (!$entry.length) {
      notyImages();
    } else {
      getImages($entry);
    }
  }

  function cleanSource(response) {
    var responseText = response.responseText;
    responseText = responseText.replace(/[\s\n]+src[\s\n]*=[\s\n]*/gi, ' data-src=');
    responseText = responseText.replace(/^[^<]*/, '');
    return $(responseText);
  }

  function rightClickEvent(_this, callback) {
    var $this = $(_this),
      name = configs.name;

    configs.href = $this.attr('href');
    chapName = $this.text().trim();

    if (typeof name === 'function') {
      chapName = name(_this, chapName);
    } else if (typeof name === 'string') {
      chapName = $(name).text().trim() + ' ' + chapName;
    }

    notyWait();

    GM.xmlHttpRequest({
      method: 'GET',
      url: configs.href,
      onload: function (response) {
        var $data = cleanSource(response);
        if (typeof callback === 'function') {
          callback($data);
        } else {
          getContents($data);
        }
      },
      onerror: function () {
        notyError();
      },
    });
  }

  function oneProgress() {
    if (inProgress) {
      noty('Chỉ được phép <strong>tải một truyện</strong> mỗi lần', 'error');
      return false;
    }
    inProgress = true;
    return true;
  }

  function getSource(callback) {
    var $link = $(configs.link);

    if (!$link.length) return;

    $link.on('contextmenu', function (e) {
      e.preventDefault();
      if (!oneProgress()) return;

      rightClickEvent(this, callback);
    });

    notyReady();
  }

  function getTruyenTranh8() {
    getSource(function ($data) {
      var packer = $data.find('#logoTT8,center').siblings('script:first').text().trim().split('eval')[1],
        lstImages = [];

      eval(eval(packer));
      checkImages(lstImages);
    });
  }

  function getIuTruyenTranh($data) {
    function init($data) {
      var $goiy = $data.find('.goiy');

      if ($goiy.length) {
        var comic_id, chap_index, chap_id;
        try {
          var matched = configs.href.match(/(\d+)-.*?\/c([\d.\-a-z]+)\.html\?id=(\d+)$/i);
          comic_id = matched[1];
          chap_index = matched[2];
          chap_id = matched[3];
          // eslint-disable-next-line no-empty
        } catch (error) {}

        var recentPassword = sessionStorage.getItem('recent-password');
        var pass = prompt(
          'Truyện yêu cầu nhập mật khẩu, gợi ý là:\n\n' +
            $goiy.text() +
            '\n\nSử dụng mã gõ tắt để nhập nhanh:\n{{ comic_id }}: ID truyện (' +
            comic_id +
            ')\n{{ chap_index }}: Thứ tự chương (' +
            chap_index +
            ')\n{{ chap_id }}: ID chương (' +
            chap_id +
            ')',
          recentPassword ? recentPassword : '{{ chap_index }}ltn'
        );

        if (!pass || !pass.trim()) {
          notyError();
          return;
        }
        pass = pass.trim();
        sessionStorage.setItem('recent-password', pass);

        pass = pass.replace(/\{\{\s*comic_id\s*\}\}/, comic_id);
        pass = pass.replace(/\{\{\s*chap_index\s*\}\}/, chap_index);
        pass = pass.replace(/\{\{\s*chap_id\s*\}\}/, chap_id);

        GM.xmlHttpRequest({
          method: 'POST',
          url: configs.href,
          data: 'act=doUnclock&pass=' + pass,
          headers: {
            withCredentials: true,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          onload: function (response) {
            getIuTruyenTranh(cleanSource(response));
          },
          onerror: function () {
            notyError();
          },
        });
        return;
      }

      var packer = $data.filter('div.wrapper').find('script:first').text().trim().split('eval')[1],
        lstImages = [];

      eval(eval(packer));
      checkImages(lstImages);
    }

    !$data ? getSource(init) : init($data);
  }

  function getNtruyen() {
    getSource(function ($data) {
      var $entry = $data.find('#containerListPage');
      if (!$entry.length) {
        notyImages();
      } else {
        if (isEmpty($entry)) {
          var id = configs.href.match(/\/(\d+)\/[\w\d-]+$/i)[1];
          $.ajax({
            type: 'post',
            url: '/MainHandler.ashx',
            data: JSON.stringify({
              id: 3,
              method: 'getChapter',
              params: [id],
            }),
            contentType: 'application/json',
            dataType: 'json',
          }).done(function (data) {
            var input = data.result.data.listPages,
              regex = /src="([^"]+)"/gi,
              matches,
              output = [];

            // eslint-disable-next-line no-cond-assign
            while ((matches = regex.exec(input))) {
              output.push(decodeURIComponent(matches[1]));
            }
            checkImages(output);
          });
        } else {
          configs.contents = '#containerListPage';
          getContents($data);
        }
      }
    });
  }

  function getA3Manga() {
    getSource(function ($data) {
      var $entry = $data.find('#chapter-content script');
      if (!$entry.length) {
        notyImages();
      } else {
        $entry = $entry.text().replace('document.write(chapterHTML);', '').trim();
        if (!$entry) {
          notyImages();
          return;
        }

        /* global CryptoJS, chapterHTML */
        // eslint-disable-next-line no-inner-declarations, no-unused-vars
        function CryptoJSAesDecrypt(passphrase, encrypted_json_string) {
          var obj_json = JSON.parse(encrypted_json_string);

          var encrypted = obj_json.ciphertext;
          var salt = CryptoJS.enc.Hex.parse(obj_json.salt);
          var iv = CryptoJS.enc.Hex.parse(obj_json.iv);

          var key = CryptoJS.PBKDF2(passphrase, salt, {
            hasher: CryptoJS.algo.SHA512,
            keySize: 64 / 8,
            iterations: 999,
          });

          var decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });
          return decrypted.toString(CryptoJS.enc.Utf8);
        }
        String.prototype.replaceAll = function (search, replacement) {
          var target = this;
          return target.split(search).join(replacement);
        };

        eval($entry);
        $entry = $(chapterHTML);

        var images = [];
        $entry.each(function (i, v) {
          var imgLink = $(v).data('9rqz');
          imgLink = imgLink.replaceAll('@9rQz^', '.');
          imgLink = imgLink.replaceAll('~4ZLsA*', ':');
          imgLink = imgLink.replaceAll('^u$UZ!QyI<yt_Z2}', '/');
          images.push(imgLink);
        });
        checkImages(images);
      }
    });
  }

  function getTruyenTranhTuan() {
    getSource(function ($data) {
      var $entry = $data.find('#read-title').next('script');
      if (!$entry.length) {
        notyImages();
      } else {
        $data = $entry.text().match(/slides_page_url_path\s=\s([^\]]+)/)[1];
        $data = JSON.parse($data + ']');
        checkImages($data);
      }
    });
  }

  function getMangaK() {
    getSource(function ($data) {
      var $entry = $data.find('.vung_doc script');
      if (!$entry.length) {
        notyImages();
      } else {
        $data = $entry
          .text()
          .replace(/^[\n\s]*var\scontent\s?=\s?/, '')
          .replace(/,\];[\n\s]*$/, ']');
        $data = JSON.parse($data);
        checkImages($data);
      }
    });
  }

  function renderCanvasLH(cdn, key, ext) {
    function renderImage(imageIndex, filename) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          var cv = fragment.getElementById('cv-' + imageIndex);
          var ctx = cv.getContext('2d');

          cv.width = this.width;
          cv.height = this.height;
          var cvWidth = this.width;
          var cvHeight = this.height;

          var blockSize = 20;
          var blockColCount = Math.floor(cvWidth / blockSize);
          var blockRowCount = Math.floor(cvHeight / blockSize);
          var blockColOffset = cvWidth - blockColCount * blockSize;
          var blockRowOffset = cvHeight - blockRowCount * blockSize;

          var mapPush = [];
          var mapUnshift = [];
          var shuffleMap = [];
          var blockMap = [];

          for (var iCol = 0; iCol < blockColCount; iCol++) {
            for (var iRow = 0; iRow < blockRowCount; iRow++) {
              mapPush.push({
                x: iCol * blockSize,
                y: iRow * blockSize,
              });
              mapUnshift.unshift({
                x: iCol * blockSize,
                y: iRow * blockSize,
              });
            }
          }

          for (var i = 0; i < Math.floor(mapUnshift.length / 2); i++) {
            shuffleMap.push(mapUnshift[i]);
            shuffleMap.push(mapUnshift[mapUnshift.length - 1 - i]);
          }
          if (mapUnshift.length % 2 !== 0) {
            shuffleMap.push(mapUnshift[Math.floor(mapUnshift.length / 2) + 1]);
          }
          for (var j = 0; j < shuffleMap.length; j++) {
            var iMap = j + 10 > shuffleMap.length - 1 ? j + 10 - shuffleMap.length : j + 10;
            blockMap.push(shuffleMap[iMap]);
          }

          blockMap.forEach(function (block, index) {
            ctx.drawImage(
              img,
              block.x,
              block.y,
              blockSize,
              blockSize,
              mapPush[index].x,
              mapPush[index].y,
              blockSize,
              blockSize
            );
          });
          if (blockColOffset) {
            for (var m = 0; m <= blockRowCount; m++) {
              ctx.drawImage(
                img,
                blockColCount * blockSize,
                m * blockSize,
                blockColOffset,
                blockSize,
                blockColCount * blockSize,
                m * blockSize,
                blockColOffset,
                blockSize
              );
            }
          }
          if (blockRowOffset) {
            for (var n = 0; n < blockRowCount; n++) {
              ctx.drawImage(
                img,
                n * blockSize,
                blockRowCount * blockSize,
                blockSize,
                blockRowOffset,
                n * blockSize,
                blockRowCount * blockSize,
                blockSize,
                blockRowOffset
              );
            }
          }

          URL.revokeObjectURL(tempBlob[imageIndex]);

          dlZip.file(filename + '.webp', cv.toDataURL('image/webp').split(';base64,')[1], {
            base64: true,
          });
          dlFinal++;
          nextLH();

          resolve(ctx);
        };

        GM.xmlHttpRequest({
          method: 'GET',
          url: cdn[0] + atob(key[imageIndex]) + '.' + atob(ext[imageIndex]),
          responseType: 'arraybuffer',
          onload: function (response) {
            var blob = new Blob([response.response], {
              type: getImageType(response.response).mime,
            });
            img.src = URL.createObjectURL(blob);
            tempBlob[imageIndex] = blob;
          },
          onerror: function (err) {
            dlZip.file(filename + '_error.txt', err.statusText + '\r\n' + err.finalUrl);
            dlFinal++;
            nextLH();

            reject(err);
          },
        });
      });
    }

    function addZipLH() {
      var path = '';
      if (inMerge) path = genFileName() + '/';

      var max = dlCurrent + threading;
      if (max > dlTotal) max = dlTotal;

      for (dlCurrent; dlCurrent < max; dlCurrent++) {
        var filename = ('0000' + dlCurrent).slice(-4);

        var cv = document.createElement('canvas');
        cv.id = 'cv-' + dlCurrent;
        cv.width = 0;
        cv.height = 0;
        fragment.append(cv);

        progressLH.push(renderImage(dlCurrent, path + filename));
      }
    }

    function nextLH() {
      noty('<strong class="centered">' + dlFinal + '/' + dlTotal + '</strong>', 'warning');

      if (dlFinal < dlCurrent) return;

      if (dlFinal < dlTotal) {
        addZipLH();
      } else {
        tempBlob = [];

        Promise.all(progressLH).then(function () {
          if (inMerge) {
            if (dlAll.length) {
              linkSuccess();
              endZip();
            } else {
              inMerge = false;
              genZip();
            }
          } else {
            genZip();
          }
        });
      }
    }

    var fragment = new DocumentFragment(),
      progressLH = [],
      tempBlob = [];

    dlTotal = key.length - 1;
    addZipLH();

    noty('Bắt đầu tải <strong>' + chapName + '</strong>', 'warning');
  }

  function getTruyenTranhLH() {
    getSource(function ($data) {
      var $packer = $data.find('#chapter-images');
      if (!$packer.length) {
        configs.contents = '[class="chapter-content"]';
        configs.filter = true;
        getContents($data);
        return;
      }

      eval(
        $packer
          .next('script')
          .text()
          .split('var ' + '_' + '0' + 'x' + 'c320')[0]
      );
      // eslint-disable-next-line no-undef
      renderCanvasLH(eval('_' + '0' + 'x' + '5f54'), eval('_' + '0' + 'x' + '5213'), eval('_' + '0' + 'x' + '52f5'));

      $win.on('beforeunload', function () {
        return 'Progress is running...';
      });
    });
  }

  function getTruyenHay24h() {
    getSource(function ($data) {
      $data = $data.find('#dvContentChap').siblings('script').text();
      $data = $data.match(/GI2017\(([^;]+);/)[1];
      $data = $data.split(/[,']+/);

      $.post('/TH24Service.asmx/GetChapterImages', {
        PID: $data[0],
        ChapNumber: $data[1],
        cc18: $data[2],
        name: '',
        s: 0,
      })
        .done(function (response) {
          var images = [];
          $(response)
            .find('string')
            .each(function (i, v) {
              images[i] = v.textContent.replace(/\.(jpe?g|png)\w*$/, '.$1');
            });

          checkImages(images);
        })
        .fail(function () {
          notyError();
        });
    });
  }

  function getThichTruyenTranh() {
    getSource(function ($data) {
      $data = $data.find('#content_read').next('script').text();
      $data = $data.match(/https?:\/\/[^"]+/g);
      if (!$data.length) {
        notyImages();
      } else {
        checkImages($data);
      }
    });
  }

  function getTruyen1() {
    $(configs.link).on('contextmenu', function (e) {
      e.preventDefault();
      if (!oneProgress()) return;

      var $this = $(this);

      configs.href = $this.attr('href');
      chapName = $('h1.title').text().trim() + ' ' + $this.text().trim();
      notyWait();

      var chapKey = configs.href.match(/\/(\d+)\/[^/]+$/);
      if (!chapKey) {
        notyError();
        return;
      }
      chapKey = chapKey[1];

      $.ajax({
        url: '/MainHandler.ashx',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
          id: 2,
          method: 'getChapter',
          params: [chapKey],
        }),
        contentType: 'application/json',
      })
        .done(function (response) {
          if (!response.result) {
            notyError();
            return;
          }
          if (response.result.hasErrors) {
            notyImages();
            return;
          }
          var data = response.result.data.listPages.match(/https?:\/\/[^"]+/g);
          if (!data.length) {
            notyImages();
          } else {
            checkImages(data);
          }
        })
        .fail(function () {
          notyError();
        });
    });

    notyReady();
  }

  function getOtakuSan() {
    getSource(function ($data) {
      var data = $data.find('#inpit-c').val();
      data = JSON.parse(data);
      checkImages(data);
    });
  }

  function getTtManga() {
    getSource(function ($data) {
      var data = $data.find('#divImage').siblings('script').first().text();
      if (!/lstImages\.push\("([^"]+)"\)/.test(data)) {
        notyImages();
      } else {
        var regex = /lstImages\.push\("([^"]+)"\)/gi,
          matches,
          output = [];

        // eslint-disable-next-line no-cond-assign
        while ((matches = regex.exec(data))) {
          output.push(decodeURIComponent(matches[1]));
        }
        checkImages(output);
      }
    });
  }

  function getTruyenSieuHay() {
    getSource(function ($data) {
      var sID = $data.find('#content_chap').find('script:not([type]):first').text();
      sID = /\bgetContentchap\('(\w+)'\)\B/.exec(sID)[1];
      $.ajax({
        type: 'POST',
        url: '/Service.asmx/getContentChap',
        data: '{ sID: "' + sID + '",chuc:"k" }',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
          var regex = /\s+src='(http[^']+)'/gi,
            matches,
            output = [];

          data = data.d;
          // eslint-disable-next-line no-cond-assign
          while ((matches = regex.exec(data))) {
            output.push(decodeURIComponent(matches[1]));
          }
          checkImages(output);
        },
        error: function () {
          notyImages();
        },
      });
    });
  }

  var configsDefault = {
      reverse: true,
      link: '',
      name: '',
      contents: '',
      filter: false,
      init: getSource,
    },
    configs,
    chapName,
    $noty = [],
    notyTimeout,
    domainName = location.host,
    tit = document.title,
    $win = $(window),
    $doc = $(document),
    dlZip = new JSZip(),
    dlPrevZip = false,
    dlCurrent = 0,
    dlFinal = 0,
    dlTotal = 0,
    dlImages = [],
    dlAll = [],
    inProgress = false,
    inAuto = false,
    inCustom = false,
    inMerge = false;

  GM_registerMenuCommand('Download All Chapters', downloadAll);
  GM_registerMenuCommand('Download All To One File', downloadAllOne);

  $doc.on('keydown', function (e) {
    if (e.which === 89 && e.altKey) {
      // Alt+Y
      e.preventDefault();
      e.shiftKey ? downloadAllOne() : downloadAll();
    }
  });

  GM_addStyle(
    '#baivong_noty_wrap{display:none;background:#fff;position:fixed;z-index:2147483647;right:20px;top:20px;min-width:150px;max-width:100%;padding:15px 25px;border:1px solid #ddd;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.1),0 1px 10px rgba(0,0,0,.35);cursor:pointer}#baivong_noty_content{color:#444}#baivong_noty_content strong{font-weight:700}#baivong_noty_content.baivong_info strong{color:#2196f3}#baivong_noty_content.baivong_success strong{color:#4caf50}#baivong_noty_content.baivong_warning strong{color:#ffc107}#baivong_noty_content.baivong_error strong{color:#f44336}#baivong_noty_content strong.centered{display:block;text-align:center}#baivong_noty_close{position:absolute;right:0;top:0;font-size:18px;color:#ddd;height:20px;width:20px;line-height:20px;text-align:center}#baivong_noty_wrap:hover #baivong_noty_close{color:#333}'
  );

  switch (domainName) {
    case 'truyentranhtam.com':
    case 'truyentranh8.org':
    case 'truyentranh869.com':
    case 'truyentranh86.com':
      configs = {
        link: '#ChapList a',
        name: function (_this) {
          return $('.breadcrumb li:last').text().trim() + ' ' + $(_this).find('span, strong, h2').text().trim();
        },
        init: getTruyenTranh8,
      };
      break;
    case 'm.truyentranhtam.com':
    case 'm.truyentranh8.org':
    case 'm.truyentranh869.com':
    case 'm.truyentranh86.com':
      configs = {
        link: '.chapter-link',
        name: 'h1',
        init: getTruyenTranh8,
      };
      break;
    case 'iutruyentranh.com':
      configs = {
        link: '#chaplist a',
      };
      getIuTruyenTranh();
      break;
    case 'truyentranh.net':
    case 'www.truyentranh.net':
      configs = {
        reverse: false,
        link: '.content a',
        name: function (_this) {
          return _this.title;
        },
        contents: '.paddfixboth-mobile',
      };
      break;
    case 'comicvn.net':
    case 'beeng.net':
      configs = {
        link: '.manga-chapter a',
        name: '#site-title',
        contents: '#image-load',
      };
      break;
    case 'hamtruyen.com':
    case 'www.hamtruyen.com':
      configs = {
        link: '.tenChapter a',
        name: '.tentruyen',
        contents: '#content_chap',
      };
      break;
    case 'm.hamtruyen.com':
      configs = {
        link: '.list-chap a',
        name: '.tentruyen',
        contents: '#content_chap',
      };
      break;
    case 'ntruyen.info':
      configs = {
        link: '.cellChapter a',
        name: 'h1',
        init: getNtruyen,
      };
      break;
    case 'a3manga.com':
    case 'www.a3manga.com':
      configs = {
        link: '.table-striped a',
        init: getA3Manga,
      };
      break;
    case 'truyentranhtuan.com':
      configs = {
        link: '.chapter-name a',
        init: getTruyenTranhTuan,
      };
      break;
    case 'mangak.info':
      configs = {
        link: '.chapter-list a',
        init: getMangaK,
      };
      break;
    case 'truyentranhlh.com':
    case 'truyentranhlh.net':
      configs = {
        link: '#tab-chapper a',
        init: getTruyenTranhLH,
      };
      break;
    case 'hocvientruyentranh.com':
    case 'hocvientruyentranh.net':
      configs = {
        link: '.table-scroll a',
        name: '.__name',
        contents: '.manga-container',
      };
      break;
    case 'truyenhay24h.com':
      configs = {
        link: '.nano .chapname a',
        name: '.name_sp',
        init: getTruyenHay24h,
      };
      break;
    case 'thichtruyentranh.com':
      configs = {
        reverse: false,
        link: '#listChapterBlock .ul_listchap a',
        init: getThichTruyenTranh,
      };
      break;
    case 'truyen1.net':
      configs = {
        link: '#MainContent_CenterContent_detailStoryControl_listChapter a',
        init: getTruyen1,
      };
      break;
    case 'hentailxx.com':
    case 'www.hentailxx.com':
    case 'm.hentailxx.com':
      configs = {
        link: '#listChuong .col-5 a',
        name: 'h1.title-detail',
        contents: '#content_chap',
      };
      break;
    case 'hentaivn.net':
      configs = [
        {
          link: '.listing a',
          name: function (_this) {
            return $(_this).find('.chuong_t').attr('title');
          },
          contents: '#image',
        },
        {
          link: '.episodes a',
          name: '[itemprop="name"] b',
          contents: '#image',
        },
      ];
      break;
    case 'otakusan.net':
      configs = {
        link: '.read-chapter a',
        name: 'h1.header',
        init: getOtakuSan,
      };
      break;
    case 'ngonphongcomics.com':
      configs = {
        link: '.comic-intro .table-striped a',
        name: '.info-title',
        contents: '.view-chapter',
        filter: true,
      };
      break;
    case 'www.nettruyen.com':
      configs = {
        link: '#nt_listchapter .row a',
        name: '.title-detail',
        contents: '.reading-detail.box_doc',
      };
      break;
    case 'www.hamtruyentranh.net':
      configs = {
        link: '#examples a',
        name: function (_this, chap) {
          var $this = $(_this);
          $this.find('span').remove();
          return $('.title-manga').text().trim() + ' ' + chap;
        },
        contents: '.each-page',
      };
      break;
    case 'ttmanga.com':
      configs = {
        link: '#list-chapter a',
        init: getTtManga,
      };
      break;
    case 'truyen.vnsharing.site':
      configs = {
        link: '#manga-chaplist a',
        contents: '.read_content',
      };
      break;
    case 'blogtruyen.com':
    case 'blogtruyen.vn':
    case 'blogtruyen.top':
    case 'www.blogtruyen.com':
    case 'www.blogtruyen.vn':
    case 'www.blogtruyen.top':
      configs = {
        link: '#list-chapters .title a',
        contents: '#content',
      };
      break;
    case 'm.blogtruyen.com':
    case 'm.blogtruyen.vn':
    case 'm.blogtruyen.top':
      configs = {
        link: '#listChapter a',
        contents: '.content',
      };
      break;
    case 'truyensieuhay.com':
      configs = {
        link: '#chapter-list-flag a',
        name: 'h1',
        init: getTruyenSieuHay,
      };
      break;
    case 'truyenchon.com':
      configs = {
        link: '#nt_listchapter .chapter a',
        name: 'h1',
        contents: '.reading-detail',
      };
      break;
    case 'truyenqq.com':
      configs = {
        link: '.works-chapter-list a',
        name: 'h1',
        contents: '.story-see-content',
      };
      break;
    case 'sachvui.com':
      configs = {
        reverse: false,
        link: '#list-chapter a[href^="https://sachvui.com/doc-sach/"]',
        name: 'h1.ebook_title',
        contents: '.noi_dung_online',
      };
      break;
    case 'hentaicube.net':
      configs = {
        link: '.wp-manga-chapter a',
        name: 'h1',
        contents: '.reading-content',
      };
      break;
    default:
      configs = {};
      break;
  }

  if (Array.isArray(configs)) {
    var isMobile = /mobi|android|touch|mini/i.test(navigator.userAgent.toLowerCase());
    configs = configs[isMobile ? 1 : 0];
  }
  if (!configs) return;

  configs = $.extend(configsDefault, configs);
  configs.init();
});
