import React from "react";
import YAML from "js-yaml";
import toast from "react-hot-toast";
import { AiOutlineUpload } from "react-icons/ai";
import { Button } from "src/components/Button";
import { Input } from "src/components/Input";
import { Modal, ModalProps } from "src/components/Modal";
import useConfig from "src/hooks/store/useConfig";
import styled from "styled-components";

const StyledModalContent = styled(Modal.Content)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const StyledUploadWrapper = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
  border: 2px dashed ${({ theme }) => theme.BACKGROUND_TERTIARY};
  border-radius: 5px;
  width: 100%;
  min-height: 200px;
  padding: 16px;
  cursor: pointer;

  input[type="file"] {
    display: none;
  }
`;

const StyledFileName = styled.span`
  color: ${({ theme }) => theme.INTERACTIVE_NORMAL};
`;

const StyledUploadMessage = styled.h3`
  color: ${({ theme }) => theme.INTERACTIVE_ACTIVE};
  margin-bottom: 0;
`;

export const ImportModal: React.FC<ModalProps> = ({ visible, setVisible }) => {
  const setYaml = useConfig(state => state.setYaml);
  const [url, setURL] = React.useState("");
  const [yamlFile, setYamlFile] = React.useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setYamlFile(e.target.files?.item(0));
  };

  const handleImportFile = () => {
    if (url) {
      setYamlFile(null);

      toast.loading("Loading...", { id: "toastFetch" });
      return fetch(url)
        .then(res => res.json())
        .then(json => {
          setYaml(YAML.load(json));
          setVisible(false);
        })
        .catch(() => toast.error("Failed to fetch JSON!"))
        .finally(() => toast.dismiss("toastFetch"));
    }

    if (yamlFile) {
      const reader = new FileReader();

      reader.readAsText(yamlFile, "UTF-8");
      reader.onload = function (data) {
        setYaml(data.target?.result as string);
        setVisible(false);
      };
    }
  };

  return (
    <Modal visible={visible} setVisible={setVisible}>
      <Modal.Header>Import YAML</Modal.Header>
      <StyledModalContent>
        <Input
          value={url}
          onChange={e => setURL(e.target.value)}
          type="url"
          placeholder="URL of YAML to fetch"
        />
        <StyledUploadWrapper>
          <input
            key={yamlFile?.name}
            onChange={handleFileChange}
            type="file"
            accept="text/vnd.yaml"
          />
          <AiOutlineUpload size={48} />
          <StyledUploadMessage>Click Here to Upload YAML</StyledUploadMessage>
          <StyledFileName>{yamlFile?.name ?? "None"}</StyledFileName>
        </StyledUploadWrapper>
      </StyledModalContent>
      <Modal.Controls setVisible={setVisible}>
        <Button
          status="SECONDARY"
          onClick={handleImportFile}
          disabled={!(yamlFile || url)}
        >
          Import
        </Button>
      </Modal.Controls>
    </Modal>
  );
};
