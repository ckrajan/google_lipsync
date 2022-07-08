/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
let lipsyncMain,
    baselineObj,
    model,
    video2

function loadBaseline() {
    return new Promise((resolve) => {
        $.getJSON("/asset/baseline/data.json", (json) => {
            resolve(json)
        });
    });
}

function gameProcessing(result) {
    document.getElementById("debug-score").innerHTML = Math.round(result.matchScore)
}

// $(window).on('load', async function () {

// });

var startButton = document.getElementById('start-button');
startButton.onclick = startPredicting;

var stopButton = document.getElementById('stop-button');
stopButton.onclick = stopPredicting;

var finalAverage = document.getElementById('final_average');
finalAverage.onclick = finalAverageScore;

async function startPredicting() {
    document.getElementById("loader").style.display = "inline";
    startButton.disabled = true;
    model = await facemesh.load();
    baselineObj = await loadBaseline()
    lipsyncMain = lipsync()
    await lipsyncMain.init(video2, gameProcessing, model)
    await lipsyncMain.setup(baselineObj)
    lipsyncMain.start()
}

function stopPredicting() {
    startButton.disabled = false;
    lipsyncMain.stop()
}

function finalAverageScore() {
    document.getElementById("final-score").innerHTML = "Final Score: " + lipsyncMain.average().toFixed(1) + "/1000";
}

$("#upload-button").click(function () {
    $("#upload").click();
});

$('#upload').change(function () {
    document.getElementById("loader").style.display = "inline";

    startButton.style.display = "none";
    stopButton.style.display = "none";
    finalAverage.style.display = "none";
    startButton.disabled = false;
    stopButton.disabled = true;
    finalAverage.disabled = true;

    var ID = 'processed_video';

    setTimeout(function () {

        var video_id = 'batch_video';
        video_id = ID + '_mp4';

        const ID2 = ID;
        const video_id2 = video_id;

        var upload_file = document.getElementById('upload').files[0];

        let videoMetaData = (upload_file) => {
            return new Promise(function (resolve, reject) {
                video2 = document.createElement('video');
                video2.addEventListener('canplay', function () {
                    resolve({
                        video: video2,
                        duration: Math.round(video2.duration * 1000),
                        height: video2.videoHeight,
                        width: video2.videoWidth
                    });
                });
                video2.src = URL.createObjectURL(upload_file);
                document.body.appendChild(video2);
                video2.style.display = "none";
                video2.hidden = true;
                // video2.muted = true;
                //   video2.play();
                video2.controls = true;

                //   video2.style.cssText = `
                //           position: fixed;
                //           left: 20vw;
                //           top: -2vh;
                //           width: 27vw;
                //           height: 65vh;
                //         `;
            })
        }

        videoMetaData($('#upload')[0].files[0]).then(function (value) {
            let videoCanvas = document.createElement('canvas');
            videoCanvas.height = value.height;
            videoCanvas.width = value.width;
            videoCanvas.getContext('2d').drawImage(value.video, 0, 0);
            var snapshot = videoCanvas.toDataURL('image/png');

            var arr = snapshot.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            var thumb_blob = new Blob([u8arr], { type: mime });
            var thumbfile = new File([thumb_blob], ID2 + '_thumb.png');

            var url = window.URL.createObjectURL(thumbfile);
            var a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = ID2 + '_thumb.png';
            document.body.appendChild(a);
            // a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        })

        var blob = upload_file.slice(0, upload_file.size, 'video/mp4');
        var rename_file = new File([blob], video_id2 + '.mp4');

        var url = window.URL.createObjectURL(rename_file);
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = video_id2 + '.mp4';
        document.body.appendChild(a);
        // a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);

        document.getElementById("loader").style.display = "none";
        startButton.style.display = "inline";
        stopButton.style.display = "inline";
        finalAverage.style.display = "inline";
        stopButton.disabled = true;
        finalAverage.disabled = true;
    }, 5000);

});