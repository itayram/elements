import {
  type CustomLinkComponent,
  ElementsOptionsProvider,
  ExportButtonProps,
  Logo,
  ParsedDocs,
  PoweredByLink,
  resolveRelativeLink,
  SidebarLayout,
  TableOfContents,
  TableOfContentsItem,
} from '@stoplight/elements-core';
import { ExtensionAddonRenderer } from '@stoplight/elements-core/components/Docs';
import { Flex, Heading } from '@stoplight/mosaic';
import { NodeType } from '@stoplight/types';
import * as React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { ServiceNode } from '../../utils/oas/types';
import { computeAPITree, findFirstNodeSlug, isInternal, resolveRelativePath } from './utils';

type SidebarLayoutProps = {
  serviceNode: ServiceNode;
  logo?: string;
  hideTryItPanel?: boolean;
  hideTryIt?: boolean;
  hideSamples?: boolean;
  hideSchemas?: boolean;
  hideInternal?: boolean;
  hideServerInfo?: boolean;
  hideSecurityInfo?: boolean;
  hideExport?: boolean;
  exportProps?: ExportButtonProps;
  tryItCredentialsPolicy?: 'omit' | 'include' | 'same-origin';
  tryItCorsProxy?: string;
  renderExtensionAddon?: ExtensionAddonRenderer;
  basePath?: string;
  outerRouter?: boolean;
};

export const APIWithSidebarLayout: React.FC<SidebarLayoutProps> = ({
  serviceNode,
  logo,
  hideTryItPanel,
  hideTryIt,
  hideSamples,
  hideSchemas,
  hideSecurityInfo,
  hideServerInfo,
  hideInternal,
  hideExport,
  exportProps,
  tryItCredentialsPolicy,
  tryItCorsProxy,
  renderExtensionAddon,
  basePath = '/',
  outerRouter = false,
}) => {
  const container = React.useRef<HTMLDivElement>(null);
  const tree = React.useMemo(
    () => computeAPITree(serviceNode, { hideSchemas, hideInternal }),
    [serviceNode, hideSchemas, hideInternal],
  );
  const location = useLocation();
  const { pathname: currentPath } = location;
  const relativePath = resolveRelativePath(currentPath, basePath, outerRouter);
  const isRootPath = relativePath === '/';
  const node = isRootPath ? serviceNode : serviceNode.children.find(child => child.uri === relativePath);

  const layoutOptions = React.useMemo(
    () => ({
      hideTryIt: hideTryIt,
      hideTryItPanel,
      hideSamples,
      hideServerInfo: hideServerInfo,
      hideSecurityInfo: hideSecurityInfo,
      hideExport: hideExport || node?.type !== NodeType.HttpService,
    }),
    [hideTryIt, hideServerInfo, hideSecurityInfo, hideExport, hideTryItPanel, hideSamples, node?.type],
  );

  if (!node) {
    // Redirect to the first child if node doesn't exist
    const firstSlug = findFirstNodeSlug(tree);

    if (firstSlug) {
      return <Navigate to={resolveRelativeLink(firstSlug)} replace />;
    }
  }

  if (hideInternal && node && isInternal(node)) {
    return <Navigate to="." replace />;
  }

  const sidebar = (
    <Sidebar serviceNode={serviceNode} logo={logo} container={container} pathname={relativePath} tree={tree} />
  );

  return (
    <SidebarLayout ref={container} sidebar={sidebar}>
      {node && (
        <ElementsOptionsProvider renderExtensionAddon={renderExtensionAddon}>
          <ParsedDocs
            key={relativePath}
            uri={relativePath}
            node={node}
            nodeTitle={node.name}
            layoutOptions={layoutOptions}
            location={location}
            exportProps={exportProps}
            tryItCredentialsPolicy={tryItCredentialsPolicy}
            tryItCorsProxy={tryItCorsProxy}
            renderExtensionAddon={renderExtensionAddon}
          />
        </ElementsOptionsProvider>
      )}
    </SidebarLayout>
  );
};

type SidebarProps = {
  serviceNode: ServiceNode;
  logo?: string;
  container: React.RefObject<HTMLElement>;
  pathname: string;
  tree: TableOfContentsItem[];
};

export const Sidebar: React.FC<SidebarProps> = ({ serviceNode, logo, container, pathname, tree }) => {
  const handleTocClick = () => {
    if (container.current) {
      container.current.scrollIntoView();
    }
  };

  return (
    <>
      <a href="/">
        <Flex ml={4} mb={5} alignItems="center">
          {logo ? (
            <Logo logo={{ url: logo, altText: 'logo' }} />
          ) : (
            serviceNode.data.logo && <Logo logo={serviceNode.data.logo} />
          )}
          <Heading size={4}>{serviceNode.name}</Heading>
        </Flex>
      </a>
      <Flex flexGrow flexShrink overflowY="auto" direction="col">
        <TableOfContents
          tree={tree}
          activeId={pathname}
          Link={Link as CustomLinkComponent}
          onLinkClick={handleTocClick}
        />
      </Flex>
      <PoweredByLink source={serviceNode.name} pathname={pathname} packageType="elements" />
    </>
  );
};
Sidebar.displayName = 'Sidebar';
