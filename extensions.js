Array.prototype.chunk = function (size) {
    return this.reduce((groups, item, i) => {
        const groupIndex = Math.floor(i / size);

        if (groups[groupIndex]) groups[groupIndex].push(item);
        else groups[groupIndex] = [item];
        
        return groups;
    }, [])
};

Array.prototype.sum = function () {
    return this.reduce((sum, current) => sum + current, 0);
}