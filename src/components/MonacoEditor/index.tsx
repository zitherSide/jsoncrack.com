import React from "react";
import Editor, { loader, Monaco } from "@monaco-editor/react";
import YAML from "js-yaml";
// import { setDiagnosticsOptions } from 'react-monaco'
// import { parse } from "jsonc-parser";
import { Loading } from "src/components/Loading";
import useConfig from "src/hooks/store/useConfig";
import useGraph from "src/hooks/store/useGraph";
import useStored from "src/hooks/store/useStored";
import { parser, recalcSize } from "src/utils/yamlParser";
// import { parser } from "src/utils/jsonParser";
import styled from "styled-components";

loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs",
  },
});

const editorOptions = {
  formatOnPaste: true,
  minimap: {
    enabled: false,
  },
};

const StyledWrapper = styled.div`
  display: grid;
  height: calc(100vh - 36px);
  grid-template-columns: 100%;
  grid-template-rows: minmax(0, 1fr);
`;

function handleEditorWillMount(monaco: Monaco) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    // monaco.languages.yaml.jsonDefaults.setDiagnosticsOptions({
    allowComments: true,
    comments: "ignore",
  });
}

export const MonacoEditor = ({
  setHasError,
}: {
  setHasError: (value: boolean) => void;
}) => {
  // const json = useConfig(state => state.json);
  const yaml = useConfig(state => state.yaml);
  const expand = useConfig(state => state.expand);
  const setYaml = useConfig(state => state.setYaml);
  // const setJson = useConfig(state => state.setJson);
  const setGraphValue = useGraph(state => state.setGraphValue);
  const lightmode = useStored(state => (state.lightmode ? "light" : "vs-dark"));
  const [value, setValue] = React.useState<string | undefined>("");
  const hidesComment = useConfig(state => state.hideComment);
  const filters = useConfig(state => state.filters);

  React.useEffect(() => {
    const { nodes, edges } = parser(yaml, expand);
    nodes.map(n => {
      // n.text = n.text.filter(t => t[0] !== 'name')
      // nodes.filter(n => console.log("text type", typeof(n.text)))
      // if(n.text?.isArray()){
      if (hidesComment && n.text.filter) {
        filters.keys.forEach(f => (n.text = n.text.filter(t => t[0] !== f)));
        filters.values.forEach(f => (n.text = n.text.filter(t => t[1] !== f)));
        //   n.text = n.text
        //     // .map(console.log('n.text', JSON.stringify(n.text)))
        //     .filter(t => t[0] !== 'name')
        //     .filter(t => t[0] !== 'description')
        //     .filter(t => t[0] !== 'comment')
      }
      // n.text = [['text', 'value']]
      // console.log('text type', typeof(n.text))
      // console.log('text', n.text)
    });
    recalcSize(nodes);

    // nodes.filter(n => console.log("node", JSON.stringify(n)))
    // nodes.filter(n => console.log("text type", typeof(n.text)))

    setGraphValue("loading", true);
    setGraphValue("nodes", nodes);
    // console.log('nodes', nodes)
    setGraphValue("edges", edges);
    setValue(yaml);
  }, [expand, yaml, setGraphValue, filters, hidesComment]);

  React.useEffect(() => {
    const formatTimer = setTimeout(() => {
      if (!value) {
        setHasError(false);
        return setYaml("");
      }

      const errors = [];
      const parsedYaml = YAML.dump(YAML.load(value));
      // const parsedJSON = JSON.stringify(parse(value, errors), null, 2);
      if (errors.length) return setHasError(true);
      // console.log('value', value)
      setYaml(value);
      // setYaml(parsedYaml);
      // setJSON(parsedJSON);
      setHasError(false);
    }, 1200);

    return () => clearTimeout(formatTimer);
  }, [value, setYaml, setHasError]);

  return (
    <StyledWrapper>
      <Editor
        height="100%"
        defaultLanguage="yaml"
        value={value}
        theme={lightmode}
        options={editorOptions}
        onChange={setValue}
        loading={<Loading message="Loading Editor..." />}
        beforeMount={handleEditorWillMount}
      />
    </StyledWrapper>
  );
};
