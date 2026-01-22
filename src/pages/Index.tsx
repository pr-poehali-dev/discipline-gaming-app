import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: number;
  title: string;
  time: string;
  points: number;
  completed: boolean;
  category: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const Index = () => {
  const [userPoints, setUserPoints] = useState(850);
  const [currentLevel, setCurrentLevel] = useState(5);
  const nextLevelPoints = 1000;
  const levelProgress = (userPoints / nextLevelPoints) * 100;

  const ranks = [
    { level: 1, name: 'Новичок', minPoints: 0 },
    { level: 2, name: 'Ученик', minPoints: 200 },
    { level: 3, name: 'Практик', minPoints: 400 },
    { level: 4, name: 'Эксперт', minPoints: 600 },
    { level: 5, name: 'Мастер', minPoints: 800 },
    { level: 6, name: 'Гуру', minPoints: 1000 },
  ];

  const currentRank = ranks.find(r => r.level === currentLevel)?.name || 'Новичок';

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Утренняя зарядка', time: '07:00', points: 50, completed: false, category: 'Здоровье' },
    { id: 2, title: 'Медитация', time: '07:30', points: 30, completed: false, category: 'Здоровье' },
    { id: 3, title: 'Завтрак', time: '08:00', points: 20, completed: false, category: 'Здоровье' },
    { id: 4, title: 'Работа над проектом', time: '09:00', points: 100, completed: false, category: 'Работа' },
    { id: 5, title: 'Чтение книги', time: '20:00', points: 40, completed: false, category: 'Развитие' },
    { id: 6, title: 'Планирование на завтра', time: '21:00', points: 30, completed: false, category: 'Организация' },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 1, title: 'Первые шаги', description: 'Выполните первую задачу', icon: 'Award', unlocked: true },
    { id: 2, title: 'Неделя дисциплины', description: 'Выполните все задачи 7 дней подряд', icon: 'Trophy', unlocked: true },
    { id: 3, title: 'Ранняя птица', description: 'Выполните утреннюю задачу до 8:00', icon: 'Sunrise', unlocked: true },
    { id: 4, title: 'Мастер времени', description: 'Выполните все задачи за день', icon: 'Clock', unlocked: false },
    { id: 5, title: 'Марафонец', description: 'Выполните задачи 30 дней подряд', icon: 'Flame', unlocked: false },
    { id: 6, title: 'Легенда', description: 'Достигните 1000 баллов', icon: 'Crown', unlocked: false },
  ]);

  const motivationalQuotes = [
    'Дисциплина — мост между целями и достижениями',
    'Каждый день — новая возможность стать лучше',
    'Маленькие шаги каждый день приводят к большим результатам',
    'Ты сильнее, чем думаешь. Продолжай!',
    'Успех — это сумма небольших усилий, повторяемых изо дня в день',
  ];

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const handleTaskToggle = (taskId: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted) {
          setUserPoints(prev => prev + task.points);
        } else {
          setUserPoints(prev => Math.max(0, prev - task.points));
        }
        return { ...task, completed: newCompleted };
      }
      return task;
    }));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const dailyProgress = (completedTasks / totalTasks) * 100;

  const stats = [
    { label: 'Задачи выполнены', value: `${completedTasks}/${totalTasks}`, icon: 'CheckCircle2', color: 'text-green-600' },
    { label: 'Баллов заработано', value: userPoints, icon: 'Star', color: 'text-yellow-600' },
    { label: 'Текущий уровень', value: currentLevel, icon: 'TrendingUp', color: 'text-blue-600' },
    { label: 'Серия дней', value: '12', icon: 'Flame', color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
            <Icon name="Target" size={24} />
            <span>DisciplineQuest</span>
          </div>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-purple-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {currentRank}
                  </h1>
                  <p className="text-gray-600">Уровень {currentLevel}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-purple-600">{userPoints}</div>
                  <p className="text-sm text-gray-500">баллов</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>До следующего уровня</span>
                  <span className="font-semibold">{nextLevelPoints - userPoints} баллов</span>
                </div>
                <Progress value={levelProgress} className="h-3" />
              </div>
            </div>
          </Card>
        </header>

        <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 animate-slide-up">
          <div className="flex items-start gap-3">
            <Icon name="Sparkles" size={24} className="text-purple-600 mt-1" />
            <div>
              <p className="text-lg font-medium text-gray-800">{currentQuote}</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Icon name="ListTodo" size={18} className="mr-2" />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Icon name="Award" size={18} className="mr-2" />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Расписание на сегодня</h2>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {completedTasks}/{totalTasks}
                  </Badge>
                </div>
                <Progress value={dailyProgress} className="h-2" />
              </div>
            </Card>

            <div className="grid gap-4">
              {tasks.map((task, index) => (
                <Card 
                  key={task.id} 
                  className={`p-4 transition-all duration-300 hover:shadow-lg cursor-pointer animate-slide-up ${
                    task.completed ? 'bg-green-50 border-green-300' : 'bg-white/80 backdrop-blur-sm border-purple-200'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleTaskToggle(task.id)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                      className="h-6 w-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">{task.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={16} />
                          {task.time}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-purple-600">
                          <Icon name="Star" size={16} />
                          +{task.points} баллов
                        </span>
                      </div>
                    </div>
                    {task.completed && (
                      <div className="flex items-center gap-2 text-green-600 animate-scale-in">
                        <Icon name="CheckCircle2" size={24} />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold animate-pulse-glow">
                  {currentLevel}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{currentRank}</h2>
                  <p className="text-gray-600">Уровень {currentLevel}</p>
                </div>
                <div className="flex justify-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{userPoints}</div>
                    <div className="text-sm text-gray-600">Баллов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600">{achievements.filter(a => a.unlocked).length}</div>
                    <div className="text-sm text-gray-600">Достижений</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Система рангов</h3>
              <div className="space-y-3">
                {ranks.map((rank) => (
                  <div 
                    key={rank.level}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      rank.level === currentLevel 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        rank.level <= currentLevel 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {rank.level}
                      </div>
                      <span className="font-semibold">{rank.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{rank.minPoints}+ баллов</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Ваши достижения</h2>
              <p className="text-gray-600 mb-6">Открыто {achievements.filter(a => a.unlocked).length} из {achievements.length}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <Card 
                    key={achievement.id}
                    className={`p-4 transition-all duration-300 animate-scale-in ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 hover:shadow-lg' 
                        : 'bg-gray-100 opacity-60'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                          : 'bg-gray-300 text-gray-500'
                      }`}>
                        <Icon name={achievement.icon as any} size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.unlocked && (
                          <Badge className="mt-2 bg-green-600">Получено!</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card 
                  key={stat.label}
                  className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center ${stat.color}`}>
                      <Icon name={stat.icon as any} size={24} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Прогресс за неделю</h3>
              <div className="space-y-3">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                  const progress = Math.floor(Math.random() * 100);
                  return (
                    <div key={day} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{day}</span>
                        <span className="text-gray-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400">
              <div className="flex items-center gap-4">
                <Icon name="TrendingUp" size={32} className="text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-green-800">Отличная работа!</h3>
                  <p className="text-green-700">Вы на пути к новым достижениям. Продолжайте в том же духе!</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default Index;
