import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Grid, 
  Chip,
  Divider,
  Collapse,
  IconButton,
  Fade
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  EmojiNature as EmojiNatureIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { ESG_COLORS } from '../theme/esgTheme';

const SustainabilityTips = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarkedTips, setBookmarkedTips] = useState([]);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBookmarkToggle = (id) => {
    if (bookmarkedTips.includes(id)) {
      setBookmarkedTips(bookmarkedTips.filter(tipId => tipId !== id));
    } else {
      setBookmarkedTips([...bookmarkedTips, id]);
    }
  };

  const tips = [
    {
      id: 1,
      title: "Reducing Scope 2 Emissions",
      category: "environment",
      summary: "Strategies for reducing electricity-related emissions",
      content: "Scope 2 emissions come from purchased electricity, heat, and steam. To reduce these emissions, consider switching to renewable energy sources, implementing energy efficiency measures, and using smart building technologies. Many organizations have achieved 30-50% reductions in Scope 2 emissions through these approaches.",
      icon: <EmojiNatureIcon />,
      color: ESG_COLORS.environment
    },
    {
      id: 2,
      title: "Employee Engagement in Sustainability",
      category: "social",
      summary: "Involving your workforce in ESG initiatives",
      content: "Engaging employees in sustainability efforts can significantly boost your social metrics. Consider creating green teams, sustainability challenges, and recognition programs. Companies with high employee engagement in sustainability initiatives report 16% higher productivity and 37% lower absenteeism.",
      icon: <PeopleIcon />,
      color: ESG_COLORS.social
    },
    {
      id: 3,
      title: "ESG Reporting Best Practices",
      category: "governance",
      summary: "Improving transparency and disclosure quality",
      content: "High-quality ESG reporting builds trust with stakeholders. Ensure your reports include clear metrics, year-over-year comparisons, and specific goals. Follow standards like GRI, SASB, or TCFD. Companies with transparent ESG reporting typically receive valuations 4-6% higher than peers with poor disclosure practices.",
      icon: <AccountBalanceIcon />,
      color: ESG_COLORS.governance
    },
    {
      id: 4,
      title: "Supply Chain Emissions Tracking",
      category: "environment",
      summary: "Methods for measuring Scope 3 emissions",
      content: "Scope 3 emissions often represent over 70% of a company's carbon footprint. Implement supplier surveys, use industry-specific emission factors, and consider blockchain-based tracking systems. Leading companies are now requiring suppliers to report emissions data and set reduction targets as part of procurement contracts.",
      icon: <EmojiNatureIcon />,
      color: ESG_COLORS.environment
    },
  ];

  const renderTipCard = (tip) => (
    <Fade in={true} timeout={500} style={{ transitionDelay: `${tip.id * 100}ms` }}>
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          borderLeft: `4px solid ${tip.color}`,
          width: '100%',
          m: 0,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                mr: 1.5, 
                color: tip.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {tip.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {tip.title}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => handleBookmarkToggle(tip.id)}
              sx={{ color: bookmarkedTips.includes(tip.id) ? tip.color : 'text.secondary' }}
            >
              {bookmarkedTips.includes(tip.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Box>
          
          <Chip 
            label={tip.category.charAt(0).toUpperCase() + tip.category.slice(1)} 
            size="small" 
            sx={{ 
              backgroundColor: `${tip.color}20`, 
              color: tip.color,
              fontWeight: 'bold',
              mb: 1.5
            }} 
          />
          
          <Typography variant="body1" sx={{ mb: 1 }}>
            {tip.summary}
          </Typography>
          
          <Collapse in={expandedId === tip.id} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                {tip.content}
              </Typography>
            </Box>
          </Collapse>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button 
            onClick={() => handleExpandClick(tip.id)}
            endIcon={
              <ExpandMoreIcon sx={{ 
                transform: expandedId === tip.id ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }} />
            }
            sx={{ 
              color: tip.color,
              '&:hover': {
                backgroundColor: `${tip.color}10`,
              }
            }}
          >
            {expandedId === tip.id ? 'Read Less' : 'Read More'}
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
      <Box sx={{ mb: 3, width: '100%', m: 0 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: ESG_COLORS.brand.dark }}>
          Industry Best Practices & Resources
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Stay updated with the latest sustainability trends and reporting practices
        </Typography>
        
        <Grid container spacing={0} sx={{ width: '100%', m: 0 }}>
          <Grid item xs={12} sx={{ p: 0, width: '100%' }}>
            {tips.map(tip => renderTipCard(tip))}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SustainabilityTips;
