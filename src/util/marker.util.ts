import consts from '../consts.ts';

function getMarkerName(s: string): string {
    const matches = s.match(/(?<=\[)[\s\S]*?(?=\])/);

    if (matches === null || matches.length === 0) {
        return s;
    }
    if (!matches[0].startsWith(consts.DATABASE_MARKER)) {
        return s;
    }

    const name = matches[0].slice(consts.DATABASE_MARKER.length);
    if (name.startsWith('-')) {
        return name.substring(1);
    }
    return name;
}

function toMarkerName(s: string) {
    return `${consts.DATABASE_MARKER}-${s}`;
}

function isMarkedName(s: string) {
    const matches = s.match(/(?<=\[)[\s\S]*?(?=\])/);

    if ((matches ?? ['']).indexOf(consts.DATABASE_MARKER) > -1) {
        return true;
    }
    return false;
}

function invalidateMarker(s: string) {
    return s.replaceAll(/(?<=\[)[\s\S]*?(?=\])/g, 'invalid-property');
}

const markers = {
    getName: getMarkerName,
    toMarkerName: toMarkerName,
    isMarkedName: isMarkedName,
    invalidate: invalidateMarker,
};
export default markers;
