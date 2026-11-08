"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import AppleIcon from "@mui/icons-material/Apple";
import ShopRoundedIcon from "@mui/icons-material/ShopRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=co.id.newmb.btnsyariah&hl=id";
const APP_STORE_URL =
  "https://apps.apple.com/sg/app/bale-syariah-by-bsn/id6590610395";

export default function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (isUser) {
    return (
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: "0.88rem", sm: "0.94rem" },
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          textWrap: "pretty",
          overflowWrap: "anywhere",
        }}
      >
        {content}
      </Typography>
    );
  }

  // Parse lines to detect markdown tables and regular blocks
  const lines = content.split("\n");
  const blocks: Array<
    | { type: "table"; headers: string[]; rows: string[][] }
    | { type: "text"; lines: string[] }
  > = [];

  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentTextLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isTableRow = line.startsWith("|") && line.endsWith("|") && line.length > 2;

    if (isTableRow) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // Check if it's separator row (| :--- | :--- |)
      const isSeparator = cells.every((c) => /^:?-+:?$/.test(c));

      if (isSeparator) {
        // Just the divider line between header and body
        continue;
      }

      if (!currentTable) {
        // Table started
        if (currentTextLines.length > 0) {
          blocks.push({ type: "text", lines: [...currentTextLines] });
          currentTextLines = [];
        }
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
    } else {
      if (currentTable) {
        blocks.push({ type: "table", ...currentTable });
        currentTable = null;
      }
      currentTextLines.push(lines[i]);
    }
  }

  if (currentTable) {
    blocks.push({ type: "table", ...currentTable });
  }
  if (currentTextLines.length > 0) {
    blocks.push({ type: "text", lines: currentTextLines });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {blocks.map((block, idx) => {
        if (block.type === "table") {
          return (
            <TableContainer
              key={idx}
              component={Paper}
              variant="outlined"
              sx={(theme) => ({
                my: 1.5,
                borderRadius: 2.5,
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                overflowX: "auto",
                ...theme.applyStyles("dark", {
                  bgcolor: "rgba(255, 255, 255, 0.02)",
                }),
              })}
            >
              <Table size="small" aria-label="Tabel rincian">
                <TableHead>
                  <TableRow
                    sx={(theme) => ({
                      bgcolor: "rgba(0, 103, 71, 0.06)",
                      ...theme.applyStyles("dark", {
                        bgcolor: "rgba(20, 184, 129, 0.1)",
                      }),
                    })}
                  >
                    {block.headers.map((h, hIdx) => (
                      <TableCell
                        key={hIdx}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: "primary.main",
                          py: 1.2,
                          px: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {block.rows.map((row, rIdx) => (
                    <TableRow
                      key={rIdx}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {row.map((cell, cIdx) => (
                        <TableCell
                          key={cIdx}
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: cIdx === 0 ? 600 : 400,
                            py: 1.15,
                            px: 1.5,
                            color: "text.primary",
                            lineHeight: 1.5,
                            verticalAlign: "middle",
                          }}
                        >
                          {parseInlineSpans(cell, `cell-${rIdx}-${cIdx}`)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }

        // Text block
        const textContent = block.lines.join("\n");
        const hasPlayStore = textContent.includes(PLAY_STORE_URL);
        const hasAppStore = textContent.includes(APP_STORE_URL);

        return (
          <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{
                fontSize: { xs: "0.88rem", sm: "0.94rem" },
                lineHeight: 1.7,
                textWrap: "pretty",
                overflowWrap: "anywhere",
                color: "text.primary",
              }}
            >
              {renderFormattedText(textContent)}
            </Typography>

            {/* If the message references mobile apps, display prominent action buttons */}
            {(hasPlayStore || hasAppStore) && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {hasPlayStore && (
                  <Chip
                    icon={<ShopRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Download di Google Play"
                    component="a"
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    color="primary"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      py: 2.2,
                      px: 0.5,
                      boxShadow: "0 2px 6px rgba(0, 103, 71, 0.2)",
                    }}
                  />
                )}
                {hasAppStore && (
                  <Chip
                    icon={<AppleIcon sx={{ fontSize: 18 }} />}
                    label="Download di App Store"
                    component="a"
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      py: 2.2,
                      px: 0.5,
                      borderColor: "primary.main",
                    }}
                  />
                )}
              </Stack>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Parses markdown inline syntax (bold, URLs, phone numbers) into React nodes.
 */
function renderFormattedText(text: string): React.ReactNode[] {
  const paragraphs = text.split("\n");
  const nodes: React.ReactNode[] = [];

  paragraphs.forEach((p, pIdx) => {
    if (!p.trim()) {
      nodes.push(<Box key={`br-${pIdx}`} sx={{ height: 6 }} />);
      return;
    }

    // Check if line is a bullet or numbered list
    const isOrderedList = /^\d+\.\s+/.test(p.trim());
    const isBulletList = /^[-*]\s+/.test(p.trim());

    const lineContent = p.trim().replace(/^(\d+\.\s+|[-*]\s+)/, "");
    const inlineNodes = parseInlineSpans(lineContent, `p-${pIdx}`);

    if (isOrderedList) {
      const match = p.trim().match(/^(\d+)\.\s+/);
      const num = match ? match[1] : "";
      nodes.push(
        <Box
          key={`ol-${pIdx}`}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.2,
            my: 0.35,
            pl: 0.5,
          }}
        >
          <Box
            sx={{
              minWidth: 22,
              height: 22,
              borderRadius: "50%",
              bgcolor: "rgba(0, 103, 71, 0.1)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.74rem",
              fontWeight: 700,
              flexShrink: 0,
              mt: 0.2,
            }}
          >
            {num}
          </Box>
          <Box sx={{ flex: 1 }}>{inlineNodes}</Box>
        </Box>
      );
    } else if (isBulletList) {
      nodes.push(
        <Box
          key={`ul-${pIdx}`}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.2,
            my: 0.35,
            pl: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              flexShrink: 0,
              mt: 1.1,
            }}
          />
          <Box sx={{ flex: 1 }}>{inlineNodes}</Box>
        </Box>
      );
    } else {
      nodes.push(
        <Box key={`txt-${pIdx}`} sx={{ my: 0.25 }}>
          {inlineNodes}
        </Box>
      );
    }
  });

  return nodes;
}

/**
 * Parses bold text, clickable URLs / phone numbers, and highlighted brackets.
 */
function parseInlineSpans(text: string, keyPrefix: string): React.ReactNode[] {
  // Regex pattern for bold **text**, URLs http(s)://..., phone numbers, or bracket highlights [STATUS: ...]
  const regex = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|150\s?286|1500\s?286|\[(?:STATUS|PLAFON|ANGSURAN|RINGKASAN|HASIL|KEPUTUSAN)[^\]]*\])/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} style={{ fontWeight: 700, color: "inherit" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Bracketed Highlight Pills (e.g. [STATUS: LAYAK], [ANGSURAN: Rp .../bulan])
    if (part.startsWith("[") && part.endsWith("]")) {
      const isError = part.includes("TIDAK LAYAK");
      const isWarning = part.includes("DENGAN DP") || part.includes("PERLU PENYESUAIAN");
      const isSuccess = part.includes("LAYAK") && !isError && !isWarning;

      const bgColor = isError
        ? "rgba(211, 47, 47, 0.1)"
        : isWarning
        ? "rgba(237, 108, 2, 0.12)"
        : isSuccess
        ? "rgba(0, 103, 71, 0.12)"
        : "rgba(0, 103, 71, 0.08)";

      const textColor = isError
        ? "#c62828"
        : isWarning
        ? "#b45309"
        : "primary.main";

      const borderColor = isError
        ? "rgba(211, 47, 47, 0.3)"
        : isWarning
        ? "rgba(237, 108, 2, 0.35)"
        : "rgba(0, 103, 71, 0.25)";

      return (
        <Box
          key={key}
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            bgcolor: bgColor,
            color: textColor,
            border: 1,
            borderColor: borderColor,
            borderRadius: 1.5,
            px: 0.9,
            py: 0.2,
            mx: 0.3,
            fontSize: "0.82rem",
            fontWeight: 800,
            letterSpacing: "0.2px",
            verticalAlign: "baseline",
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }

    if (part.startsWith("http://") || part.startsWith("https://")) {
      let cleanUrl = part;
      // Strip trailing punctuation if accidentally matched
      if (cleanUrl.endsWith(".") || cleanUrl.endsWith(",")) {
        cleanUrl = cleanUrl.slice(0, -1);
      }

      // Check if it's PlayStore or AppStore (handled above via dedicated buttons, but give nice link text)
      const isPlayStore = cleanUrl.includes("play.google.com");
      const isAppStore = cleanUrl.includes("apps.apple.com");
      const label = isPlayStore
        ? "Google PlayStore"
        : isAppStore
        ? "Apple AppStore"
        : cleanUrl.replace(/^https?:\/\/(www\.)?/, "");

      return (
        <Link
          key={key}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-inline-flex",
            alignItems: "center",
            gap: 0.3,
            color: "primary.main",
            fontWeight: 600,
            textDecoration: "underline",
            wordBreak: "break-all",
            "&:hover": { color: "primary.dark" },
          }}
        >
          {label}
          <OpenInNewRoundedIcon sx={{ fontSize: 13, ml: 0.2, verticalAlign: "middle" }} />
        </Link>
      );
    }

    if (part === "150 286" || part === "1500 286") {
      const tel = part.replace(/\s+/g, "");
      return (
        <Link
          key={key}
          href={`tel:${tel}`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.3,
            color: "primary.main",
            fontWeight: 700,
            bgcolor: "rgba(0, 103, 71, 0.08)",
            px: 0.75,
            py: 0.15,
            borderRadius: 1,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <PhoneInTalkRoundedIcon sx={{ fontSize: 13 }} />
          {part}
        </Link>
      );
    }

    return part;
  });
}
