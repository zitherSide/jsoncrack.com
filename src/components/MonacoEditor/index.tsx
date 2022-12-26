import React from "react";
import Editor, { loader, Monaco } from "@monaco-editor/react";
// import { setDiagnosticsOptions } from 'react-monaco'
// import { parse } from "jsonc-parser";
import { Loading } from "src/components/Loading";
import useConfig from "src/hooks/store/useConfig";
import useGraph from "src/hooks/store/useGraph";
import useStored from "src/hooks/store/useStored";
import { parser } from "src/utils/yamlParser";
// import { parser } from "src/utils/jsonParser";
import styled from "styled-components";
import YAML from 'js-yaml'

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

  React.useEffect(() => {
    const { nodes, edges } = parser(yaml, expand);
    nodes.map(n => {
      // n.text = n.text.filter(t => t[0] !== 'name')
      //   if(typeof(n.text) === typeof(Array)){
      //   n.text = n.text.filter(t => t[0] !== 'name')
      // }
      // n.text = [['text', 'value']]
      console.log('text type', typeof(n.text))
      console.log('text', n.text)
    })

    setGraphValue("loading", true);
    setGraphValue("nodes", nodes);
    console.log('nodes', nodes)
    setGraphValue("edges", edges);
    setValue(yaml);
  }, [expand, yaml, setGraphValue]);

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

      setYaml(parsedYaml);
      // setJSON(parsedJSON);
      setHasError(false);
    }, 1200);

    return () => clearTimeout(formatTimer);
  }, [value, setYaml, setHasError]);

  return (
    <StyledWrapper>
      <Editor
        height="100%"
        defaultLanguage="json"
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
