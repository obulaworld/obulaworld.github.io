let fromCurrency;
let toCurrency;
let amount;
let query;
let count = 0
let result = null;

if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('sw.js').then(function(registration) {
        console.log('Service worker registration succeeded:', registration);
    }).catch(function(error) {
        console.log('Service worker registration failed:', error);
    });
} else {
    console.log('Service workers are not supported.');
}

/// / This works on all devices/browsers, and uses IndexedDBShim as a final fallback
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

// Open (or create) the database
const open = indexedDB.open("currency-converter", 1);

// Create the schema
open.onupgradeneeded = () => {
    let db = open.result;
    let store = db.createObjectStore("currency-converter", {keyPath: "name"});
    let index = store.createIndex("NameIndex", ["name"]);
};

let storeData = (data,check) => {

    if(check){
        open.onsuccess = ((data,check) => {
            console.log(data);
            // Start a new transaction
            let db = open.result;
            let tx = db.transaction("currency-converter", "readwrite");
            let store = tx.objectStore("currency-converter");
            let index = store.index("NameIndex");

            let getCurrency = store.getAll();
            getCurrency.onsuccess = function () {
                if(getCurrency.result){
                    for(const currency in getCurrency.result){
                        console.log(typeof (getCurrency.result[currency].name));
                        console.log(typeof (data));
                        console.log(getCurrency.result[currency].name == data);
                        if(getCurrency.result[currency].name == data){
                            const total = parseFloat(getCurrency.result[currency].value.value) * parseFloat(amount);
                            document.getElementById("currency2").value =total;
                            result = true;
                        }
                    }
                }else{
                    result = false;
                }
            }
        })(data,check);
    }else{
        open.onsuccess = ((data,check) => {
            console.log(data);
            // Start a new transaction
            let db = open.result;
            let tx = db.transaction("currency-converter", "readwrite");
            let store = tx.objectStore("currency-converter");
            let index = store.index("NameIndex");
            let obj = {};

            for(const dt in data){
                if(data.hasOwnProperty(dt)){
                    obj={name:dt,value:{currency:dt,value:data[dt].val}};
                    store.put(obj);
                }
            }
        })(data,check);
    }
    console.log('bhj',result)
    return result;
}

let getCurrency = (() => {
    let url = 'https://free.currencyconverterapi.com/api/v5/countries';
    fetch(url)
        .then((response) => {
            return response.json()
        }).then((data) => {
        const currencies = data.results;
        for(let currency in currencies){
            if (currencies.hasOwnProperty(currency)) {
                document.getElementById("currency-to").innerHTML +=`<option value="${currencies[currency].currencyId}">${currencies[currency].currencyName}</option>`;
                document.getElementById("currency-from").innerHTML +=`<option value="${currencies[currency].currencyId}">${currencies[currency].currencyName}</option>`;
            }
        }
    })
        .catch(err =>{
            console.log('Request failed', err)
        });
})();

let convertCurrency = () => {
    fromCurrency = document.getElementById("currency-from").value;
    toCurrency = document.getElementById("currency-to").value;
    amount=document.getElementById("currency").value;
    if(amount == '' || amount <=0){
        alert('Amount to be converted cannot be zero, empty or negative');
        return;
    }
    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    query = fromCurrency + '_' + toCurrency;

    let getFromDb = storeData(query,true);
    console.log('i',getFromDb);
    if(getFromDb){
        return;
    }else{
        let url = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + query + '&compact=y';
        fetch(url)
            .then((response) => {
                return response.json()
            }).then((data) => {
            storeData(data);
            let value = data[query].val;
            if (value != undefined) {
                const total = parseFloat(value) * parseFloat(amount);
                document.getElementById("currency2").value =total;
            } else {
                const err = new Error("Value not found for " + query);
            }
        })
            .catch(err =>{
                console.log('Request failed', err)
            });
    }

}

let clearField = () =>document.getElementById("currency").value ='';
