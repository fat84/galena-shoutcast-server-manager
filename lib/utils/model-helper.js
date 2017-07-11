function AssignObjectData(target, defaults, data) {

    if (data !== null)
        for (var k in data)
            if (data.hasOwnProperty(k))
                defaults[k] = data[k];

    Object.assign(target, defaults);
}

export default { AssignObjectData };