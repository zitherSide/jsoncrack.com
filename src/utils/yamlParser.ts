import YAML from "js-yaml";

const calculateSize = (
  text: string | [string, string][],
  isParent = false,
  isExpanded: boolean
) => {
  let value = "";

  if (typeof text === "string") value = text;
  else value = text.map(([k, v]) => `${k}: ${v}`).join("\n");

  const lineCount = value.split("\n");
  const lineLengths = lineCount.map(line => line.length);
  const longestLine = lineLengths.sort((a, b) => b - a)[0];

  const getWidth = () => {
    if (Array.isArray(text) && !text.length) return 40;
    if (isExpanded) return 35 + longestLine * 8 + (isParent ? 60 : 0);
    if (isParent) return 170;
    return 200;
  };

  const getHeight = () => {
    if (lineCount.length * 17.8 < 30) return 40;
    return (lineCount.length + 1) * 18;
  };

  return {
    width: getWidth(),
    height: getHeight(),
    // width: 80,
    // height: 80,
  };
};

const filterChild = ([_, v]) => {
  const isNull = v === null;
  const isArray = Array.isArray(v) && v.length;
  const isObject = v instanceof Object;

  return !isNull && (isArray || isObject);
};

const filterValues = ([k, v]) => {
  if (Array.isArray(v) || v instanceof Object) return false;
  return true;
};

function generateChildren(object: Object, isExpanded = true, nextId: () => string) {
  if (!(object instanceof Object)) object = [object];

  return Object.entries(object)
    .filter(filterChild)
    .flatMap(([key, v]) => {
      const { width, height } = calculateSize(key, true, isExpanded);
      const children = extract(v, isExpanded, nextId);

      return [
        {
          id: nextId(),
          text: key,
          children,
          width,
          height,
          data: {
            isParent: true,
            childrenCount: children.length,
          },
        },
      ];
    });
}

function generateNodeData(object: Object) {
  if (object instanceof Object) {
    const entries = Object.entries(object).filter(filterValues);
    return entries;
  }

  return String(object);
}

const extract = (
  os: string[] | object[] | null,
  isExpanded = true,
  nextId = (
    id => () =>
      String(++id)
  )(0)
) => {
  if (!os) return [];

  return [os].flat().map(o => {
    const text = generateNodeData(o);
    const { width, height } = calculateSize(text, false, isExpanded);

    return {
      id: nextId(),
      text,
      width,
      height,
      children: generateChildren(o, isExpanded, nextId),
      data: {
        isParent: false,
        childrenCount: 0,
        isEmpty: !text.length,
      },
    };
  });
};

const flatten = (xs: { id: string; children: never[] }[]) =>
  xs.flatMap(({ children, ...rest }) => [rest, ...flatten(children)]);

const relationships = (xs: { id: string; children: never[] }[]) => {
  return xs.flatMap(({ id: from, children = [] }) => [
    ...children.map(({ id: to }) => ({
      id: `e${from}-${to}`,
      from,
      to,
    })),
    ...relationships(children),
  ]);
};

export const parser = (jsonStr: string, isExpanded = true, filters = null) => {
  try {
    // jsonStr = indentChild(jsonStr)
    jsonStr = replaceInclude(jsonStr)
    // console.log('jsonstr', jsonStr)
    let yaml = YAML.load(jsonStr);
    const dotteds = categorizeDottedMembers(yaml)
    restructureDottedMembers(yaml, dotteds)
    
    if (!Array.isArray(yaml)) yaml = [yaml];

    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    const mappedElements = extract(yaml, isExpanded);
    const res = [...flatten(mappedElements), ...relationships(mappedElements)];

    res.forEach(data => {
      if (isNode(data)) {
        nodes.push(data);
      } else {
        edges.push(data);
      }
    });

    return { nodes, edges };
  } catch (error) {
    console.error(error);
    return {
      nodes: [],
      edges: [],
    };
  }
};

export const recalcSize = nodes => {
  nodes.forEach(n => {
    const { width, height } = calculateSize(n.text, n.data.isParent, true);
    n.width = width;
    n.height = height;
  });
  return;
};

function isNode(element: NodeData | EdgeData) {
  if ("text" in element) return true;
  return false;
}

export const replaceInclude = (data: string) => {
  const pattern = /^#include\s+(?<nodeName>.+)\s+(?<parentName>.+)$/;
  let lines = data.split(/\n/)
  const replacer = data.split(/\n/).flatMap(l => {
    const matched = l.match(pattern)
    if(matched){
      return {
        line: matched[0],
        node: matched.groups?.nodeName,
        parent: matched.groups?.parentName
      }
    }else{
      return []
    }
  })
  if(replacer.length == 0){
    return data
  }

  replacer.forEach((target, i) => {
    lines = lines.flatMap(l => {
      const parentPattern = new RegExp(`${target.parent}:`);

      if(l.match(target.line)){
        return []
      }else if(l.match(parentPattern)){
        return [l, `  include_${i}: ${target.node}`]
      }else{
        return l
      }
    })
  })
  return lines.join('\n')
};

const categorizeDottedMembers = data => {
  return Object.keys(data).map(key => {
    return {
      key: key, 
      val: data[key]
    }
  }).flatMap(elem => {
    const dotMatch = elem.key.match(/\./g)
    if(dotMatch){
      return {
        level: dotMatch.length,
        ...elem
      }
    }else{
      return []
    }
  })
}

interface DottedMember{
  level: number,
  key: string,
  val: object
}
const restructureDottedMembers = (originalData, dottedMembers: DottedMember[]) => {
  const levels = Array.from(new Set(dottedMembers.map(elem => elem.level))).sort((a, b) => b - a)
  levels.forEach(level => {
    const members = 
    dottedMembers
      .filter(elem => elem.level === level)
      .forEach(m => {
        const match = m.key.match(/(?<parent>.*)\.(?<node>[^\.]+)$/)
        if(match?.groups){
          const parent = match.groups.parent
          const node = match.groups.node
          
          if(originalData[parent]){
            originalData[parent][node] = m.val
            delete originalData[m.key]
          }
        }
      }
    )
  })
}