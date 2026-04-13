'use client';

import { useColorScheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Rating from '@mui/material/Rating';
import Slider from '@mui/material/Slider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded';
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useState } from 'react';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import { useDrawer } from '@/app/components/molecules/Drawer';
import { useDialog } from '@/app/components/molecules/Dialog';
import { useNotification } from '@/app/providers/NotificationProvider';

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        color="inherit"
      >
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function SizeLabel({ label }: { label: string }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
      {label}
    </Typography>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <Box
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.100',
        borderRadius: 1.5,
        p: 2,
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 1.6,
        overflow: 'auto',
      }}
    >
      <pre style={{ margin: 0 }}>{children}</pre>
    </Box>
  );
}

function StepCard({
  step,
  command,
  code,
  description,
}: {
  step: string;
  command: string;
  code?: string;
  description: string;
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip label={command} size="small" icon={<TerminalRoundedIcon />} />
        <Typography variant="caption" color="text.secondary">
          {step}
        </Typography>
      </Stack>
      {code && <CodeBlock>{code}</CodeBlock>}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ReadmeExpanded() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="text"
        size="small"
        onClick={() => setExpanded(!expanded)}
        endIcon={
          expanded ? (
            <KeyboardArrowUpRoundedIcon />
          ) : (
            <KeyboardArrowDownRoundedIcon />
          )
        }
      >
        {expanded ? 'Hide' : 'Show'} full guide
      </Button>
      <Collapse in={expanded}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Setup
            </Typography>
            <CodeBlock>{`cp -R ai-repo-template/ my-project/
cd my-project
# Update "name" in package.json
yarn install
yarn dev`}</CodeBlock>
          </Box>

          <Divider />

          <StepCard
            step="Build context"
            command="/creator"
            code={`/creator

I want to build [feature name] for [project name].

What it should do:
- [2-3 sentences describing the feature]

What already exists:
- [Related files, types, services, endpoints]

Constraints:
- [Must work with X, depends on API Y, follows pattern Z]`}
            description="Advises on architecture, identifies patterns, aligns on approach before any code is written."
          />

          <StepCard
            step="Discovery and planning"
            command="/plan-feature"
            code={`/plan-feature [feature-name] "[brief scope]"`}
            description="Produces three documents in tasks/: discovery doc, implementation plan, orchestration file. Each requires your approval."
          />

          <StepCard
            step="Execution"
            command="/efficient-orchestrator"
            code={`/efficient-orchestrator

Execute: tasks/{feature-name}-orchestration.md`}
            description="Parses steps into dependency waves, defines types first, executes via subagents, runs structured testing, cleans up and commits."
          />

          <StepCard
            step="Review before merging"
            command="/architecture-review"
            description="Run on your branch before merging. Loads relevant pattern files, reports violations with citations."
          />

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Tips
            </Typography>
            <Stack spacing={1.5}>
              <Alert severity="info" variant="outlined" icon={false}>
                <strong>Be specific.</strong> Mention file paths, not vague
                descriptions.
              </Alert>
              <Alert severity="info" variant="outlined" icon={false}>
                <strong>Correct early.</strong> Fix wrong assumptions in the
                discovery doc before approving the plan.
              </Alert>
              <Alert severity="info" variant="outlined" icon={false}>
                <strong>One feature per conversation.</strong> Don't mix
                unrelated work.
              </Alert>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Resume from a previous session
            </Typography>
            <CodeBlock>{`/efficient-orchestrator

Continue executing: tasks/{feature-name}-orchestration.md`}</CodeBlock>
          </Box>
        </Stack>
      </Collapse>
    </Box>
  );
}

function ButtonsSection() {
  return (
    <Section title="Buttons">
      <Stack spacing={3}>
        {/* Variants */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Variants
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained">Contained</Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="outlined" color="secondary">
              Outlined Secondary
            </Button>
            <Button variant="text">Text</Button>
            <Button variant="text" color="secondary">
              Text Secondary
            </Button>
            <Button variant="contained" disabled>
              Disabled
            </Button>
          </Stack>
        </Box>

        {/* Sizes — contained */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Sizes — Contained
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="small" />
              <Button variant="contained" size="small">
                Small
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
              >
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="medium" />
              <Button variant="contained" size="medium">
                Medium
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<AddRoundedIcon />}
              >
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="large" />
              <Button variant="contained" size="large">
                Large
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRoundedIcon />}
              >
                Add
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Sizes — outlined */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Sizes — Outlined
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="small" />
              <Button variant="outlined" size="small">
                Small
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SearchRoundedIcon />}
              >
                Search
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="medium" />
              <Button variant="outlined" size="medium">
                Medium
              </Button>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<SearchRoundedIcon />}
              >
                Search
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="large" />
              <Button variant="outlined" size="large">
                Large
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchRoundedIcon />}
              >
                Search
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Colors */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Colors
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" color="primary">
              Primary
            </Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="contained" color="success">
              Success
            </Button>
            <Button variant="contained" color="error">
              Error
            </Button>
            <Button variant="contained" color="warning">
              Warning
            </Button>
            <Button variant="contained" color="info">
              Info
            </Button>
          </Stack>
        </Box>

        {/* Icon buttons — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Icon Buttons — Sizes
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack alignItems="center" spacing={0.5}>
              <IconButton size="small">
                <EditRoundedIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                small
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <IconButton size="medium">
                <EditRoundedIcon />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                medium
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <IconButton size="large">
                <EditRoundedIcon fontSize="large" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                large
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
              <Typography variant="caption" color="text.secondary">
                badge
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}

function InputsSection() {
  const [alignment, setAlignment] = useState('left');
  return (
    <Section title="Inputs">
      <Stack spacing={3}>
        {/* TextField — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            TextField — Sizes
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="small" />
              <TextField label="Label" size="small" sx={{ width: 200 }} />
              <TextField
                label="Error"
                size="small"
                error
                helperText="Required"
                sx={{ width: 200 }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="medium" />
              <TextField label="Label" size="medium" sx={{ width: 200 }} />
              <TextField
                label="Error"
                size="medium"
                error
                helperText="Required"
                sx={{ width: 200 }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* TextField — states */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            TextField — States
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <TextField label="Default" size="small" />
            <TextField label="With value" size="small" defaultValue="Hello" />
            <TextField label="Disabled" size="small" disabled />
            <TextField
              label="Read only"
              size="small"
              defaultValue="Read only"
              slotProps={{ input: { readOnly: true } }}
            />
          </Stack>
        </Box>

        {/* Checkbox — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Checkbox & Switch — Sizes
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="small" />
              <FormControlLabel
                control={<Checkbox defaultChecked size="small" />}
                label="Checked"
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Unchecked"
              />
              <FormControlLabel
                control={<Switch defaultChecked size="small" />}
                label="On"
              />
              <FormControlLabel control={<Switch size="small" />} label="Off" />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="medium" />
              <FormControlLabel
                control={<Checkbox defaultChecked size="medium" />}
                label="Checked"
              />
              <FormControlLabel
                control={<Checkbox size="medium" />}
                label="Unchecked"
              />
              <FormControlLabel
                control={<Switch defaultChecked size="medium" />}
                label="On"
              />
              <FormControlLabel
                control={<Switch size="medium" />}
                label="Off"
              />
            </Stack>
          </Stack>
        </Box>

        {/* ToggleButton — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            ToggleButton — Sizes
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Stack alignItems="center" spacing={0.5}>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={(_, v) => v && setAlignment(v)}
                size="small"
              >
                <ToggleButton value="left">
                  <FormatAlignLeftRoundedIcon />
                </ToggleButton>
                <ToggleButton value="center">
                  <FormatAlignCenterRoundedIcon />
                </ToggleButton>
                <ToggleButton value="right">
                  <FormatAlignRightRoundedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">
                small
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={(_, v) => v && setAlignment(v)}
                size="medium"
              >
                <ToggleButton value="left">
                  <FormatAlignLeftRoundedIcon />
                </ToggleButton>
                <ToggleButton value="center">
                  <FormatAlignCenterRoundedIcon />
                </ToggleButton>
                <ToggleButton value="right">
                  <FormatAlignRightRoundedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">
                medium
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={(_, v) => v && setAlignment(v)}
                size="large"
              >
                <ToggleButton value="left">
                  <FormatAlignLeftRoundedIcon />
                </ToggleButton>
                <ToggleButton value="center">
                  <FormatAlignCenterRoundedIcon />
                </ToggleButton>
                <ToggleButton value="right">
                  <FormatAlignRightRoundedIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">
                large
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Rating — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Rating — Sizes
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="small" />
              <Rating
                defaultValue={3}
                size="small"
                icon={<StarRoundedIcon fontSize="inherit" />}
                emptyIcon={<StarRoundedIcon fontSize="inherit" />}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="medium" />
              <Rating
                defaultValue={3.5}
                precision={0.5}
                size="medium"
                icon={<StarRoundedIcon fontSize="inherit" />}
                emptyIcon={<StarRoundedIcon fontSize="inherit" />}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <SizeLabel label="large" />
              <Rating
                defaultValue={4}
                size="large"
                icon={<StarRoundedIcon fontSize="inherit" />}
                emptyIcon={<StarRoundedIcon fontSize="inherit" />}
              />
            </Stack>
          </Stack>
        </Box>

        {/* Slider — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Slider — Sizes
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 300 }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                small
              </Typography>
              <Slider defaultValue={30} size="small" valueLabelDisplay="auto" />
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                medium
              </Typography>
              <Slider
                defaultValue={60}
                size="medium"
                valueLabelDisplay="auto"
              />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}

function CardsSection() {
  return (
    <Section title="Cards & Surfaces">
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Card sx={{ minWidth: 260 }}>
          <CardContent>
            <Typography variant="h6">Default Card</Typography>
            <Typography variant="body2" color="text.secondary">
              Standard card with default paper background and elevation.
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ minWidth: 260 }}>
          <CardContent>
            <Typography variant="h6">Outlined Card</Typography>
            <Typography variant="body2" color="text.secondary">
              Flat card with border, no shadow.
            </Typography>
          </CardContent>
        </Card>
        <Paper variant="highlighted" sx={{ p: 2, minWidth: 260 }}>
          <Typography variant="h6">Highlighted Paper</Typography>
          <Typography variant="body2" color="text.secondary">
            Custom paper variant from theme customizations.
          </Typography>
        </Paper>
      </Stack>
    </Section>
  );
}

function FeedbackSection() {
  return (
    <Section title="Feedback">
      <Stack spacing={3}>
        {/* Alerts — standard (filled background) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Alerts — Standard
          </Typography>
          <Stack spacing={1}>
            <Alert severity="success">
              Success — operation completed successfully.
            </Alert>
            <Alert severity="info">
              Info — here is some useful information.
            </Alert>
            <Alert severity="warning">
              Warning — please review before proceeding.
            </Alert>
            <Alert severity="error">Error — something went wrong.</Alert>
          </Stack>
        </Box>

        {/* Alerts — outlined */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Alerts — Outlined
          </Typography>
          <Stack spacing={1}>
            <Alert severity="success" variant="outlined">
              Success outlined
            </Alert>
            <Alert severity="info" variant="outlined">
              Info outlined
            </Alert>
            <Alert severity="warning" variant="outlined">
              Warning outlined
            </Alert>
            <Alert severity="error" variant="outlined">
              Error outlined
            </Alert>
          </Stack>
        </Box>

        {/* Alerts — filled */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Alerts — Filled
          </Typography>
          <Stack spacing={1}>
            <Alert severity="success" variant="filled">
              Success filled
            </Alert>
            <Alert severity="info" variant="filled">
              Info filled
            </Alert>
            <Alert severity="warning" variant="filled">
              Warning filled
            </Alert>
            <Alert severity="error" variant="filled">
              Error filled
            </Alert>
          </Stack>
        </Box>

        {/* Progress — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Progress — Sizes
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Stack alignItems="center" spacing={0.5}>
                <CircularProgress size={20} />
                <Typography variant="caption" color="text.secondary">
                  20px
                </Typography>
              </Stack>
              <Stack alignItems="center" spacing={0.5}>
                <CircularProgress size={30} />
                <Typography variant="caption" color="text.secondary">
                  30px
                </Typography>
              </Stack>
              <Stack alignItems="center" spacing={0.5}>
                <CircularProgress size={40} />
                <Typography variant="caption" color="text.secondary">
                  40px
                </Typography>
              </Stack>
              <Stack alignItems="center" spacing={0.5}>
                <CircularProgress size={20} color="secondary" />
                <Typography variant="caption" color="text.secondary">
                  secondary
                </Typography>
              </Stack>
              <Stack alignItems="center" spacing={0.5}>
                <CircularProgress size={20} color="success" />
                <Typography variant="caption" color="text.secondary">
                  success
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={1.5} sx={{ maxWidth: 400 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  indeterminate
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  secondary
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress color="secondary" />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  success
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress color="success" />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  determinate 65%
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress variant="determinate" value={65} />
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  buffer
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="buffer"
                    value={45}
                    valueBuffer={70}
                  />
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}

function ChipsSection() {
  return (
    <Section title="Chips">
      <Stack spacing={2}>
        {/* Colors */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Colors
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Default" />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
            <Chip label="Success" color="success" />
            <Chip label="Warning" color="warning" />
            <Chip label="Error" color="error" />
            <Chip label="Info" color="info" />
          </Stack>
        </Box>

        {/* Sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Sizes
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="small" />
              <Chip label="Filled" size="small" />
              <Chip label="Outlined" size="small" variant="outlined" />
              <Chip label="Primary" size="small" color="primary" />
              <Chip label="Deletable" size="small" onDelete={() => {}} />
              <Chip
                label="Icon"
                size="small"
                icon={<CheckCircleRoundedIcon />}
                color="success"
              />
              <Chip
                avatar={
                  <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
                    D
                  </Avatar>
                }
                label="Avatar"
                size="small"
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <SizeLabel label="medium" />
              <Chip label="Filled" size="medium" />
              <Chip label="Outlined" size="medium" variant="outlined" />
              <Chip label="Primary" size="medium" color="primary" />
              <Chip label="Deletable" size="medium" onDelete={() => {}} />
              <Chip
                label="Icon"
                size="medium"
                icon={<CheckCircleRoundedIcon />}
                color="success"
              />
              <Chip avatar={<Avatar>D</Avatar>} label="Avatar" size="medium" />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}

function NavigationSection() {
  const [tab, setTab] = useState(0);
  return (
    <Section title="Navigation">
      <Stack spacing={3}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Settings" />
        </Tabs>
        <List sx={{ maxWidth: 300 }}>
          <ListItem>
            <ListItemIcon>
              <HomeRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PersonRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <Stepper activeStep={1} sx={{ maxWidth: 500 }}>
          <Step completed>
            <StepLabel>Account</StepLabel>
          </Step>
          <Step>
            <StepLabel>Profile</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review</StepLabel>
          </Step>
        </Stepper>
      </Stack>
    </Section>
  );
}

function DataDisplaySection() {
  const tableRows = [
    { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
    { name: 'Bob Smith', role: 'Designer', status: 'Active' },
    { name: 'Carol White', role: 'Manager', status: 'Away' },
  ];
  return (
    <Section title="Data Display">
      <Stack spacing={3}>
        {/* Avatar — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Avatar — Sizes
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack alignItems="center" spacing={0.5}>
              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>S</Avatar>
              <Typography variant="caption" color="text.secondary">
                24px
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>M</Avatar>
              <Typography variant="caption" color="text.secondary">
                32px
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Avatar>D</Avatar>
              <Typography variant="caption" color="text.secondary">
                40px
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Avatar sx={{ width: 56, height: 56 }}>LG</Avatar>
              <Typography variant="caption" color="text.secondary">
                56px
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Avatar sx={{ width: 72, height: 72, fontSize: 28 }}>XL</Avatar>
              <Typography variant="caption" color="text.secondary">
                72px
              </Typography>
            </Stack>
            <Stack alignItems="center" spacing={0.5}>
              <Badge badgeContent={4} color="primary">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonRoundedIcon />
                </Avatar>
              </Badge>
              <Typography variant="caption" color="text.secondary">
                badge
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Tooltip */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Tooltip
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Top" placement="top">
              <Chip label="Top" />
            </Tooltip>
            <Tooltip title="Right" placement="right">
              <Chip label="Right" />
            </Tooltip>
            <Tooltip title="Bottom" placement="bottom">
              <Chip label="Bottom" />
            </Tooltip>
            <Tooltip title="Left" placement="left">
              <Chip label="Left" />
            </Tooltip>
          </Stack>
        </Box>

        {/* Table — sizes */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Table — small
          </Typography>
          <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Active' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Table — medium
          </Typography>
          <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Active' ? 'success' : 'warning'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Section>
  );
}

const chartData = [
  { month: 'Jan', revenue: 4200, users: 2400, orders: 1800 },
  { month: 'Feb', revenue: 3800, users: 2210, orders: 1600 },
  { month: 'Mar', revenue: 5100, users: 2900, orders: 2200 },
  { month: 'Apr', revenue: 4700, users: 2780, orders: 2000 },
  { month: 'May', revenue: 5900, users: 3490, orders: 2600 },
  { month: 'Jun', revenue: 6300, users: 3800, orders: 2900 },
  { month: 'Jul', revenue: 5800, users: 3200, orders: 2400 },
];

const pieData = [
  { name: 'Desktop', value: 4500, color: 'hsl(210, 98%, 48%)' },
  { name: 'Mobile', value: 3200, color: 'hsl(210, 98%, 65%)' },
  { name: 'Tablet', value: 1200, color: 'hsl(210, 100%, 80%)' },
  { name: 'Other', value: 400, color: 'hsl(220, 20%, 65%)' },
];

function ChartsSection() {
  // Lazy import to avoid SSR issues with recharts
  const [charts, setCharts] = useState<typeof import('recharts') | null>(null);
  useState(() => {
    import('recharts').then(setCharts);
  });

  if (!charts) return null;

  const {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip: RechartsTooltip,
    Legend,
  } = charts;

  return (
    <Section title="Charts (Recharts)">
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          Charts powered by{' '}
          <Typography
            component="a"
            variant="body2"
            href="https://recharts.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Recharts
          </Typography>
          . Responsive, composable, and works with MUI theme colors.
        </Typography>

        {/* Line Chart */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Line Chart
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 20%, 88%)"
                />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(210, 98%, 48%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(120, 44%, 53%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Bar Chart */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Bar Chart
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 20%, 88%)"
                />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="revenue"
                  fill="hsl(210, 98%, 48%)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="orders"
                  fill="hsl(210, 100%, 80%)"
                  radius={[4, 4, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Area Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Area Chart
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(220, 20%, 88%)"
                  />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(210, 98%, 48%)"
                    fill="hsl(210, 100%, 92%)"
                    strokeWidth={2}
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Pie Chart */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Pie Chart
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Stack>
      </Stack>
    </Section>
  );
}

function OverlaysSection() {
  const { setDrawerChildrenAndOpen } = useDrawer();
  const { setDialogChildrenAndOpen } = useDialog();
  const { showNotification } = useNotification();

  const sampleDrawerContent = (
    <Stack spacing={2}>
      <Typography variant="h5">Drawer Content</Typography>
      <Typography variant="body2" color="text.secondary">
        This drawer is rendered once in AppProvider and controlled via context.
        Any component can open it by calling{' '}
        <Typography
          component="code"
          variant="body2"
          sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}
        >
          setDrawerChildrenAndOpen(content)
        </Typography>
        .
      </Typography>
      <Alert severity="info">
        Use{' '}
        <Typography component="code" variant="body2">
          setDrawerChildren()
        </Typography>{' '}
        to navigate within an open drawer without closing it.
      </Alert>
      <Divider />
      <Typography variant="subtitle2">Example Form</Typography>
      <TextField label="Name" size="small" fullWidth />
      <TextField label="Email" size="small" fullWidth />
      <Button variant="contained" fullWidth>
        Submit
      </Button>
    </Stack>
  );

  const sampleDialogContent = (
    <Stack spacing={2}>
      <Typography variant="h5">Dialog Content</Typography>
      <Typography variant="body2" color="text.secondary">
        This dialog is rendered once in AppProvider and controlled via context.
        Any component can open it by calling{' '}
        <Typography
          component="code"
          variant="body2"
          sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}
        >
          setDialogChildrenAndOpen(content)
        </Typography>
        .
      </Typography>
      <Alert severity="warning">
        Are you sure you want to proceed? This action cannot be undone.
      </Alert>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button variant="outlined" size="small">
          Cancel
        </Button>
        <Button variant="contained" color="error" size="small">
          Confirm
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Section title="Drawer, Dialog & Notifications">
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          Global overlays rendered once in AppProvider, controlled via hooks
          from any component. See docs/repo-structure.md for usage.
        </Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Drawer & Dialog
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => setDrawerChildrenAndOpen(sampleDrawerContent)}
            >
              Open Drawer
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDialogChildrenAndOpen(sampleDialogContent)}
            >
              Open Dialog
            </Button>
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Notifications
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              color="success"
              variant="outlined"
              onClick={() =>
                showNotification({
                  message: 'Operation completed successfully.',
                  severity: 'success',
                })
              }
            >
              Success
            </Button>
            <Button
              size="small"
              color="info"
              variant="outlined"
              onClick={() =>
                showNotification({
                  message: 'Here is some useful information.',
                  severity: 'info',
                })
              }
            >
              Info
            </Button>
            <Button
              size="small"
              color="warning"
              variant="outlined"
              onClick={() =>
                showNotification({
                  message: 'Please review before proceeding.',
                  severity: 'warning',
                })
              }
            >
              Warning
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() =>
                showNotification({
                  message: 'Something went wrong.',
                  severity: 'error',
                })
              }
            >
              Error
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                showNotification({
                  message: 'Closeable notification.',
                  severity: 'info',
                  options: { showCloseButton: true, duration: 10000 },
                })
              }
            >
              With close button
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Section>
  );
}

function AccordionSection() {
  return (
    <Section title="Accordion">
      <Box sx={{ maxWidth: 500 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography>Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Copy this template, rename the project in package.json, run yarn
              install, and start building. All conventions are documented in
              docs/repo-structure.md.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography>Theme Customization</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Edit app/styles/themePrimitives.ts to change colors, typography,
              and shadows. Component-level overrides live in
              app/styles/customizations/.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Typography>AI Skills</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              Use the Creator skill for architecture advice and the Efficient
              Orchestrator for implementation. Both are in .claude/.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Section>
  );
}

function TypographySection() {
  return (
    <Section title="Typography">
      <Stack spacing={1}>
        <Typography variant="h1">h1 — Heading</Typography>
        <Typography variant="h2">h2 — Heading</Typography>
        <Typography variant="h3">h3 — Heading</Typography>
        <Typography variant="h4">h4 — Heading</Typography>
        <Typography variant="h5">h5 — Heading</Typography>
        <Typography variant="h6">h6 — Heading</Typography>
        <Typography variant="subtitle1">
          subtitle1 — Supporting text for headings
        </Typography>
        <Typography variant="subtitle2">
          subtitle2 — Smaller supporting text
        </Typography>
        <Typography variant="body1">
          body1 — Primary body text. Used for most content across the
          application.
        </Typography>
        <Typography variant="body2">
          body2 — Secondary body text. Slightly lighter weight for supporting
          content.
        </Typography>
        <Typography variant="caption" display="block">
          caption — Small helper text, timestamps, labels
        </Typography>
      </Stack>
    </Section>
  );
}

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            AI Repo Template
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="MUI 7" size="small" color="primary" />
            <Chip label="Next.js 16" size="small" variant="outlined" />
            <Chip label="React 19" size="small" variant="outlined" />
            <ThemeToggle />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 4 }}>
        <Typography variant="h3" sx={{ mb: 3 }}>
          Getting Started
        </Typography>
        <Box sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              How to use this repo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Every new feature follows a 4-step pipeline. Each step is a
              separate skill you invoke in Claude Code:
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Step</TableCell>
                    <TableCell>Skill</TableCell>
                    <TableCell>What it does</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>
                      <Chip label="/creator" size="small" />
                    </TableCell>
                    <TableCell>
                      Builds context, advises on architecture, aligns on
                      approach
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>
                      <Chip label="/plan-feature" size="small" />
                    </TableCell>
                    <TableCell>
                      Discovers codebase, writes plan + orchestration file in
                      tasks/
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>
                      <Chip label="/efficient-orchestrator" size="small" />
                    </TableCell>
                    <TableCell>
                      Executes the plan: types first, parallel waves via
                      subagents, testing
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell>
                      <Chip label="/architecture-review" size="small" />
                    </TableCell>
                    <TableCell>
                      Reviews PR against coding pattern files before merging
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              For small fixes — just code it.
            </Typography>
            <ReadmeExpanded />
          </Box>
        </Box>

        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h3">Component Showcase</Typography>
          <Typography variant="body1" color="text.secondary">
            All components below are from{' '}
            <Typography
              component="a"
              variant="body1"
              href="https://mui.com/material-ui/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Material UI 7 (MUI)
            </Typography>{' '}
            — a comprehensive React component library with 50+ production-ready
            components. Toggle light/dark mode with the icon in the header.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theme:{' '}
            <Typography
              component="a"
              variant="body2"
              href="https://github.com/mui/material-ui/tree/v9.0.0/docs/data/material/getting-started/templates/shared-theme"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              MUI official dashboard shared-theme
            </Typography>{' '}
            with light/dark color schemes. Customize colors in{' '}
            <Typography
              component="code"
              variant="body2"
              sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}
            >
              app/styles/themePrimitives.ts
            </Typography>
            , component overrides in{' '}
            <Typography
              component="code"
              variant="body2"
              sx={{ bgcolor: 'action.hover', px: 0.5, borderRadius: 0.5 }}
            >
              app/styles/customizations/
            </Typography>
            .
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ pt: 1 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              component="a"
              href="https://mui.com/material-ui/all-components/"
              target="_blank"
              label="All MUI Components"
              size="small"
              color="primary"
              clickable
            />
            <Chip
              component="a"
              href="https://mui.com/material-ui/customization/theming/"
              target="_blank"
              label="Theming Guide"
              size="small"
              variant="outlined"
              clickable
            />
            <Chip
              component="a"
              href="https://mui.com/material-ui/getting-started/templates/"
              target="_blank"
              label="MUI Templates"
              size="small"
              variant="outlined"
              clickable
            />
            <Chip
              component="a"
              href="https://mui.com/material-ui/material-icons/"
              target="_blank"
              label="Material Icons"
              size="small"
              variant="outlined"
              clickable
            />
          </Stack>
        </Stack>

        <Stack spacing={5} divider={<Divider />}>
          <ButtonsSection />
          <InputsSection />
          <CardsSection />
          <ChipsSection />
          <FeedbackSection />
          <NavigationSection />
          <DataDisplaySection />
          <ChartsSection />
          <OverlaysSection />
          <AccordionSection />
          <TypographySection />
        </Stack>

        <Divider sx={{ my: 4 }} />
        <Stack spacing={0.5} sx={{ pb: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Built with{' '}
            <Typography
              component="a"
              variant="caption"
              href="https://mui.com/material-ui/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              Material UI 7
            </Typography>
            {' + '}
            <Typography
              component="a"
              variant="caption"
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              Next.js 16
            </Typography>
            {' + '}
            <Typography
              component="a"
              variant="caption"
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              React 19
            </Typography>
            {' + TypeScript 6'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This is not all — MUI has 50+ components including DataGrid,
            DatePicker, TreeView, and more. See the{' '}
            <Typography
              component="a"
              variant="caption"
              href="https://mui.com/material-ui/all-components/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              full component list
            </Typography>
            .
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
