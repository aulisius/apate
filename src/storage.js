let throwArg = name => {
    throw new TypeError(`undefined is not a valid value for ${name}`);
};
let set = (
    key = throwArg("key"),
    value = throwArg("value"),
    { ttl = Number.MAX_SAFE_INTEGER, shouldPersist = false } = {}
) =>
    localStorage.setItem(
        key,
        JSON.stringify({
            createdOn: Date.now(),
            value,
            ttl,
            shouldPersist
        })
    );

let getInternal = key => {
    try {
        let item = JSON.parse(localStorage.getItem(key));
        let isExpired = Date.now() >= item.createdOn + item.ttl;
        return isExpired ? remove(key) : item;
    } catch (error) {
        return null;
    }
};

let get = (key = throwArg("key"), defaultValue = null) => {
    let item = getInternal(key);
    return item ? item.value : defaultValue;
};

let remove = (key = throwArg("key")) => localStorage.removeItem(key);

let clear = (removeAll = false) => {
    let keysToDelete = [];
    let perishedItems = {};
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let item = getInternal(key);
        if (item && (!item.shouldPersist || removeAll)) {
            keysToDelete.push(key);
            perishedItems = {
                ...perishedItems,
                [key]: item.value
            };
        }
    }
    keysToDelete.forEach(remove);
    return perishedItems;
};

export default {
    set,
    get,
    remove,
    clear
};
