import React, { useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router-dom";
import { Button } from "@strapi/design-system/Button";
import Icon from "@strapi/icons/Download";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import usePluginsQueryParams from "@strapi/admin/admin/src/content-manager/hooks/usePluginsQueryParams";

const DeleteButton = () => {
  const { modifiedData, layout } = useCMEditViewDataManager();
  const accepted = ["api::collection.collection"];

  const [loading, setLoading] = useState(false);

  const { go } = useHistory();

  const { formatMessage } = useIntl();

  const handleClick = async () => {
    const uuid = "4c590453-68e8-49a5-b94b-3aababb9e5e2";
    setLoading(true);
    const response = await fetch(
      `${process.env.CLIENT_URL}/api/${layout.info.pluralName}/${modifiedData.id}/tokens/${uuid}`,
      {
        method: "delete",
        headers: {
          Authorization: `Bearer ${process.env.FRONTEND_API}`,
        },
      }
    );
    setLoading(false);
    if (response.ok) {
      go(0);
    }
  };

  return (
    <>
      {modifiedData.id && accepted.indexOf(layout.uid) > -1 && (
        <Button
          disabled={loading}
          variant={loading ? "tertiary" : "secondary"}
          startIcon={<Icon />}
          onClick={handleClick}
        >
          {loading
            ? formatMessage({
                id: "fetch-button.components.fetch.button.loading",
                defaultMessage: "Loading...",
              })
            : formatMessage({
                id: "fetch-button.components.fetch.button.delete",
                defaultMessage: "Delete All Tokens Data",
              })}
        </Button>
      )}
    </>
  );
};

export default DeleteButton;
