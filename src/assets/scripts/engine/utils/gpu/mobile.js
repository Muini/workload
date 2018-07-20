
// Last scrap 19/07/18
/*
// 'https://www.notebookcheck.net/Smartphone-Graphics-Cards-Benchmark-List.149363.0.html?sort=b_216_640&gpubenchmarks=1&deskornote=3&or=1&glbenchmark=1&gpu_fullname=1';

let mobileGPU = [];

list = document.querySelectorAll('.smartphone_odd, .smartphone_even');
list.forEach(list => {
    
    let name = list.querySelector('.specs:nth-child(2)');
    let value = list.querySelector('.value span span');
    if(!value)
        value = list.querySelector('.value span');

    let item = [name.innerText, value.innerText];

    mobileGPU.push(item);

});

console.log(JSON.stringify(mobileGPU))
*/

export default new Map([
    ["Apple A10X Fusion GPU / PowerVR", "224.5"],
    ["Apple A11 Bionic GPU", "166.9"],
    ["Qualcomm Adreno 630", "150"],
    ["ARM Mali-G72 MP18", "145.5"],
    ["Apple A9X / PowerVR Series 7XT", "140.15"],
    ["NVIDIA Tegra X1 Maxwell GPU", "123"],
    ["ARM Mali-G72 MP12", "122.5"],
    ["Apple A10 Fusion GPU / PowerVR", "114.15"],
    ["Qualcomm Adreno 540", "112"],
    ["ARM Mali-G71 MP20", "105"],
    ["Qualcomm Adreno 530", "88"],
    ["ARM Mali-T880 MP12", "82"],
    ["Apple A9 / PowerVR GT7600", "79.95"],
    ["PowerVR GXA6850", "70.4"],
    ["ARM Mali-G71 MP8", "69"],
    ["NVIDIA Tegra K1 Kepler GPU", "60"],
    ["ARM Mali-T760 MP8", "53.5"],
    ["Qualcomm Adreno 430", "49"],
    ["Qualcomm Adreno 512", "48"],
    ["PowerVR GX6450", "44.8"],
    ["Qualcomm Adreno 420", "40.7"],
    ["ARM Mali-T880 MP4", "40"],
    ["Qualcomm Adreno 509", "35.5"],
    ["Qualcomm Adreno 418", "34"],
    ["ARM Mali-T830 MP3", "34"],
    ["Intel HD Graphics (Cherry Trail)", "32"],
    ["ARM Mali-T760 MP6", "31"],
    ["Qualcomm Adreno 510", "31"],
    ["Qualcomm Adreno 508", "30"],
    ["PowerVR G6430", "27.9"],
    ["PowerVR GX6250", "26.6"],
    ["ARM Mali-T880 MP2", "24"],
    ["Qualcomm Adreno 330", "24"],
    ["PowerVR G6400", "23.6"],
    ["Qualcomm Adreno 506", "23"],
    ["ARM Mali-T628 MP6", "22.8"],
    ["ARM Mali-G71 MP2", "22"],
    ["ARM Mali-T830 MP2", "18"],
    ["NVIDIA GeForce Tegra 4", "17.5"],
    ["ARM Mali-T860 MP2", "17"],
    ["Intel HD Graphics (Bay Trail)", "16"],
    ["ARM Mali-T760 MP4", "16"],
    ["Qualcomm Adreno 505", "16"],
    ["PowerVR G6200", "15"],
    ["ARM Mali-T760 MP2", "14.6"],
    ["ARM Mali-T624", "14.2"],
    ["Qualcomm Adreno 405", "14"],
    ["Qualcomm Adreno 320", "13"],
    ["ARM Mali-T604 MP4", "12.4"],
    ["ARM Mali-T628 MP4", "12"],
    ["ARM Mali-T720 MP4", "12"],
    ["ARM Mali-T830 MP1", "12"],
    ["ARM Mali-450 MP4", "10.05"],
    ["PowerVR SGX554MP4", "9.35"],
    ["ARM Mali-T720 MP2", "8.6"],
    ["Qualcomm Adreno 308", "7.7"],
    ["PowerVR SGX544MP2", "6.95"],
    ["PowerVR SGX543MP3", "6.75"],
    ["PowerVR GE8100", "5.9"],
    ["ARM Mali-T720", "5.9"],
    ["Qualcomm Adreno 305", "5.7"],
    ["Vivante GC7000UL", "5.4"],
    ["Qualcomm Adreno 306", "5.25"],
    ["Qualcomm Adreno 304", "5.05"],
    ["ARM Mali-400 MP2", "4.2"],
    ["ARM Mali-400 MP", "4.1"],
    ["Vivante GC4000", "4.05"],
    ["ARM Mali-400 MP4", "4"],
    ["Qualcomm Adreno 225", "3.2"],
    ["NVIDIA GeForce ULP (Tegra 3)", "3.15"],
    ["Broadcom VideoCore-IV", "2.9"],
    ["PowerVR SGX545", "2.8"],
    ["PowerVR SGX544", "2.7"],
    ["Vivante GC1000+ Dual-Core", "2.5"],
    ["Qualcomm Adreno 302", "1.65"],
    ["Qualcomm Adreno 203", "1.65"],
    ["PowerVR SGX540", "0.5"],
    ["PowerVR SGX531", "0.5"],
]);