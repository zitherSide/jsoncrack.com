import React from "react";
import Editor, { loader, Monaco } from "@monaco-editor/react";
import YAML from "js-yaml";
import { Loading } from "src/components/Loading";
import useConfig from "src/hooks/store/useConfig";
import useGraph from "src/hooks/store/useGraph";
import useStored from "src/hooks/store/useStored";
import { parser, recalcSize } from "src/utils/yamlParser";
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
    allowComments: true,
    comments: "ignore",
  });
}

export const MonacoEditor = ({
  setHasError,
}: {
  setHasError: (value: boolean) => void;
}) => {
  const yaml = useConfig(state => state.yaml);
  const expand = useConfig(state => state.expand);
  const setYaml = useConfig(state => state.setYaml);
  const setGraphValue = useGraph(state => state.setGraphValue);
  const lightmode = useStored(state => (state.lightmode ? "light" : "vs-dark"));
  const [value, setValue] = React.useState<string | undefined>("");
  const hidesComment = useConfig(state => state.hideComment);
  const filters = useConfig(state => state.filters);

  React.useEffect(() => {
    const { nodes, edges } = parser(yaml, expand);
    nodes.map(n => {
      if (hidesComment && n.text.filter) {
        filters.keys.forEach(f => (n.text = n.text.filter(t => t[0] !== f)));
        filters.values.forEach(f => (n.text = n.text.filter(t => t[1] !== f)));
      }
    });
    recalcSize(nodes);

    setGraphValue("loading", true);
    setGraphValue("nodes", nodes);
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
      if (errors.length) return setHasError(true);
      setYaml(value);
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
