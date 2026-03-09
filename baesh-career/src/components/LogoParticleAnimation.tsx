import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  midTargetX: number; // 중간 목표 (퍼지는 단계)
  midTargetY: number;
  size: number;
  opacity: number;
  layer: number; // 깊이 레이어 (0: 앞, 1: 중간, 2: 뒤)
}

interface LogoParticleAnimationProps {
  logoImage: HTMLImageElement | null;
  width: number;
  height: number;
  particleCount?: number;
}

export default function LogoParticleAnimation({
  logoImage,
  width,
  height,
  particleCount = 400,
}: LogoParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const atomsRef = useRef<Array<{ nucleusX: number; nucleusY: number }>>([]); // 원자 중심점 저장
  const [animationProgress, setAnimationProgress] = useState(0); // 0~1

  // BAESH 핵심 트레이드 컬러
  const primaryColor = '#1E6FFF'; // 메인 파란색
  const secondaryColor = '#408CFF'; // 밝은 파란색

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // 성능 향상
      willReadFrequently: false, // 읽기 최적화
    });
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    
    // Canvas 렌더링 최적화 (부드러운 렌더링)
    ctx.imageSmoothingEnabled = true; // 부드러운 렌더링
    ctx.imageSmoothingQuality = 'high'; // 고품질 렌더링

    canvas.width = width;
    canvas.height = height;

    // 파티클 초기화 (텍스트 영역 주변을 원형으로 감싸도록 배치)
    const initParticles = () => {
      const particles: Particle[] = [];
      const centerX = width / 2;
      const centerY = height / 2;
      
      // 텍스트 영역의 대략적인 크기 추정
      const textAreaRadius = Math.min(width, height) * 0.2;
      const innerRadius = textAreaRadius + 60;
      const outerRadius = textAreaRadius + Math.min(width, height) * 0.4;
      
      // 원자 구조 생성: 중심 핵 + 주변 전자 궤도
      const atomCount = 6; // 원자 개수
      const atoms: Array<{ 
        nucleusX: number; 
        nucleusY: number; 
        shells: Array<{ radius: number; particles: number }> 
      }> = [];
      
      // 원자들을 텍스트 영역 주변에 배치 (원형이 아닌 원자 구조)
      for (let i = 0; i < atomCount; i++) {
        const angle = (i / atomCount) * Math.PI * 2;
        // 원자 중심을 텍스트 영역 주변에 배치
        const atomRadius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const nucleusX = centerX + Math.cos(angle) * atomRadius;
        const nucleusY = centerY + Math.sin(angle) * atomRadius;
        
        // 각 원자는 여러 전자 궤도를 가짐
        const shells = [
          { radius: 30, particles: 8 },  // 첫 번째 궤도
          { radius: 60, particles: 12 }, // 두 번째 궤도
          { radius: 90, particles: 16 }, // 세 번째 궤도
        ];
        
        atoms.push({ nucleusX, nucleusY, shells });
      }
      
      // 중심 핵 추가 (텍스트 영역 중심)
      const centerNucleus = {
        nucleusX: centerX,
        nucleusY: centerY,
        shells: [
          { radius: 40, particles: 10 },
          { radius: 80, particles: 14 },
          { radius: 120, particles: 18 },
        ]
      };
      atoms.push(centerNucleus);
      
      // 각 원자의 궤도에 파티클 배치
      let particleIndex = 0;
      for (const atom of atoms) {
        for (let shellIdx = 0; shellIdx < atom.shells.length; shellIdx++) {
          const shell = atom.shells[shellIdx];
          const particlesPerShell = Math.floor(particleCount / (atoms.length * atom.shells.length));
          
          for (let p = 0; p < particlesPerShell && particleIndex < particleCount; p++) {
            // 초기 위치: 화면 전체로 퍼진 상태에서 시작
            const spreadAngle = Math.random() * Math.PI * 2;
            const spreadRadius = Math.min(width, height) * (0.4 + Math.random() * 0.4);
            const startX = centerX + Math.cos(spreadAngle) * spreadRadius;
            const startY = centerY + Math.sin(spreadAngle) * spreadRadius;
            
            // 중간 목표: 화면 전체로 퍼진 위치 (더 넓게)
            const midSpreadAngle = Math.random() * Math.PI * 2;
            const midSpreadRadius = Math.min(width, height) * (0.5 + Math.random() * 0.5);
            const midTargetX = centerX + Math.cos(midSpreadAngle) * midSpreadRadius;
            const midTargetY = centerY + Math.sin(midSpreadAngle) * midSpreadRadius;
            
            // 최종 목표: 원자 궤도 위의 특정 위치
            const orbitAngle = (p / particlesPerShell) * Math.PI * 2 + shellIdx * 0.5;
            const orbitRadius = shell.radius;
            const targetX = atom.nucleusX + Math.cos(orbitAngle) * orbitRadius;
            const targetY = atom.nucleusY + Math.sin(orbitAngle) * orbitRadius;
            
            particles.push({
              x: startX,
              y: startY,
              vx: 0,
              vy: 0,
              targetX,
              targetY,
              size: 4,
              opacity: 0.3 + Math.random() * 0.5,
              layer: shellIdx,
              midTargetX,
              midTargetY,
            });
            
            particleIndex++;
          }
        }
      }
      
      // 남은 파티클들을 랜덤하게 배치
      while (particleIndex < particleCount) {
        const atom = atoms[particleIndex % atoms.length];
        const shell = atom.shells[particleIndex % atom.shells.length];
        
        // 초기 위치: 화면 전체로 퍼진 상태에서 시작
        const spreadAngle = Math.random() * Math.PI * 2;
        const spreadRadius = Math.min(width, height) * (0.4 + Math.random() * 0.4);
        const startX = centerX + Math.cos(spreadAngle) * spreadRadius;
        const startY = centerY + Math.sin(spreadAngle) * spreadRadius;
        
        // 중간 목표: 화면 전체로 퍼진 위치 (더 넓게)
        const midSpreadAngle = Math.random() * Math.PI * 2;
        const midSpreadRadius = Math.min(width, height) * (0.5 + Math.random() * 0.5);
        const midTargetX = centerX + Math.cos(midSpreadAngle) * midSpreadRadius;
        const midTargetY = centerY + Math.sin(midSpreadAngle) * midSpreadRadius;
        
        const orbitAngle = Math.random() * Math.PI * 2;
        const orbitRadius = shell.radius;
        const targetX = atom.nucleusX + Math.cos(orbitAngle) * orbitRadius;
        const targetY = atom.nucleusY + Math.sin(orbitAngle) * orbitRadius;
        
        particles.push({
          x: startX,
          y: startY,
          vx: 0,
          vy: 0,
          targetX,
          targetY,
          size: 4,
          opacity: 0.3 + Math.random() * 0.5,
          layer: particleIndex % 3,
          midTargetX,
          midTargetY,
        });
        
        particleIndex++;
      }

      particlesRef.current = particles;
      
      // 원자 중심점들 저장 (원자들 사이 연결선을 그리기 위해)
      const atomCenters: Array<{ nucleusX: number; nucleusY: number }> = [];
      for (const atom of atoms) {
        atomCenters.push({ nucleusX: atom.nucleusX, nucleusY: atom.nucleusY });
      }
      atomsRef.current = atomCenters;
    };

    initParticles();

    const animationDuration = 6000; // 6초에 걸쳐 한 사이클 완료 (모였다 퍼졌다)
    const startTime = performance.now();
    
    // 애니메이션 루프 (부드러운 60fps 유지)
    const animate = () => {
      // 현재 시간 기반으로 진행도 계산 (항상 업데이트됨)
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const cycleTime = elapsed % animationDuration;
      const rawProgress = cycleTime / animationDuration; // 0~1 반복
      setAnimationProgress(rawProgress);
      
      // Canvas가 유효한지 확인
      if (!canvas || !ctx) {
        console.error('Canvas or context is null');
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // 배경 페이드 효과 (트레일 효과) - 더 부드럽게
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; // 페이드 속도 조정
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      if (!particles || particles.length === 0) {
        console.warn('No particles to animate');
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      const connectionDistance = 180; // 연결선 그리기 거리 (적절한 거리로 조정)
      const repulsionDistance = 40; // 반발력 거리 (더 크게)
      const connectionDistanceSq = connectionDistance * connectionDistance; // 제곱 거리 (sqrt 제거)
      
      // 반복 애니메이션: 모였다 퍼졌다 반복 (사인파 사용으로 부드러운 전환)
      const sineProgress = Math.sin(rawProgress * Math.PI * 2); // -1 ~ 1
      const normalizedProgress = (sineProgress + 1) / 2; // 0 ~ 1로 정규화
      
      // 델타 타임 계산 (항상 양수)
      const deltaTime = 16; // 고정된 deltaTime 사용
      
      // 중앙 좌표
      const centerX = width / 2;
      const centerY = height / 2;
      
      // 파티클 이동 (반복 애니메이션: 모였다 퍼졌다)
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        let targetX, targetY;
        let moveSpeed;
        
        // 사인파를 사용하여 부드럽게 모였다 퍼지기
        // normalizedProgress: 0 (완전히 퍼짐) -> 0.5 (중앙) -> 1 (다시 퍼짐)
        const phase = normalizedProgress * Math.PI * 2; // 0 ~ 2π
        
        if (normalizedProgress < 0.5) {
          // 1단계: 퍼진 상태에서 중앙으로 모이기 (0~50%)
          const gatherProgress = normalizedProgress / 0.5; // 0 ~ 1
          // 중앙과 퍼진 위치 사이를 보간
          targetX = particle.midTargetX + (particle.targetX - particle.midTargetX) * gatherProgress;
          targetY = particle.midTargetY + (particle.targetY - particle.midTargetY) * gatherProgress;
          moveSpeed = 0.002 + gatherProgress * 0.003; // 모일수록 빠르게
        } else {
          // 2단계: 중앙에서 퍼진 상태로 (50~100%)
          const spreadProgress = (normalizedProgress - 0.5) / 0.5; // 0 ~ 1
          // 중앙과 퍼진 위치 사이를 보간
          targetX = particle.targetX + (particle.midTargetX - particle.targetX) * spreadProgress;
          targetY = particle.targetY + (particle.midTargetY - particle.targetY) * spreadProgress;
          moveSpeed = 0.005 - spreadProgress * 0.002; // 퍼질수록 느리게
        }
        
        // 목표 지점으로 부드럽게 이동
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 부드러운 움직임 (스프링 효과) - 항상 움직임
        if (distance > 0.01) {
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          const force = moveSpeed * (deltaTime / 16) * 2; // 2배 강하게
          particle.vx += normalizedDx * force;
          particle.vy += normalizedDy * force;
        } else {
          // 목표에 매우 가까워도 계속 움직이도록
          particle.vx += dx * 0.5;
          particle.vy += dy * 0.5;
        }
        
        // 파티클 간 상호작용 최적화 (인접한 파티클만 체크)
        const repulsionDistanceSq = repulsionDistance * repulsionDistance;
        let nearbyCount = 0;
        const maxNearbyCheck = 15; // 체크 개수 조정
        
        for (let j = 0; j < particles.length && nearbyCount < maxNearbyCheck; j++) {
          if (i === j) continue;
          const other = particles[j];
          const pdx = other.x - particle.x;
          const pdy = other.y - particle.y;
          const pDistanceSq = pdx * pdx + pdy * pdy;

          // 빠른 거리 체크 (제곱 거리로)
          if (pDistanceSq < repulsionDistanceSq && pDistanceSq > 0) {
            nearbyCount++;
            const pDistance = Math.sqrt(pDistanceSq);
            // 반발력 (너무 가까우면 밀어냄)
            const force = (repulsionDistance - pDistance) / repulsionDistance;
            particle.vx -= (pdx / pDistance) * force * 0.0004 * (deltaTime / 16);
            particle.vy -= (pdy / pDistance) * force * 0.0004 * (deltaTime / 16);
          }
        }
        
        // 감쇠 (마찰) - 부드러운 움직임
        const damping = 0.95; // 적절한 감쇠
        particle.vx *= damping;
        particle.vy *= damping;
        
        // 속도 제한 (너무 빠르지 않게)
        const maxSpeed = 4;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
        
        // 최소 속도 보장 (절대 멈추지 않음)
        const minSpeed = 0.02;
        if (speed < minSpeed && distance > 0.1) {
          const angle = Math.atan2(dy, dx);
          particle.vx = Math.cos(angle) * minSpeed;
          particle.vy = Math.sin(angle) * minSpeed;
        }

        // 위치 업데이트 (델타 타임 기반) - 항상 업데이트
        particle.x += particle.vx * (deltaTime / 16);
        particle.y += particle.vy * (deltaTime / 16);

        // 모일수록 투명도 증가 (더 선명하게) - 사인파 기반
        if (normalizedProgress < 0.5) {
          // 모이는 단계: 점점 선명해짐
          const gatherProgress = normalizedProgress / 0.5;
          particle.opacity = 0.4 + gatherProgress * 0.5;
        } else {
          // 퍼지는 단계: 점점 투명해짐
          const spreadProgress = (normalizedProgress - 0.5) / 0.5;
          particle.opacity = 0.9 - spreadProgress * 0.5;
        }
      }

      // 연결선 그리기 (최적화: 거리 제곱으로 비교, sqrt 최소화)
      const connectionIntensity = normalizedProgress < 0.5 
        ? 0.3 + (normalizedProgress / 0.5) * 0.5  // 모일수록 강해짐
        : 0.8 - ((normalizedProgress - 0.5) / 0.5) * 0.5;  // 퍼질수록 약해짐
      
      // 중복 연결 방지를 위한 Set
      const drawnConnections = new Set<string>();
      
      // 최적화: 각 파티클당 최대 연결 수 제한하고, 빠른 거리 체크
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const connections: Array<{ particle: Particle; distanceSq: number; index: number }> = [];
        
        // 최적화: 모든 파티클 체크 대신 인접한 파티클만 체크 (거리 제곱으로)
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distanceSq = dx * dx + dy * dy; // 제곱 거리 (sqrt 제거)

          // 빠른 거리 체크 (제곱 거리로)
          if (distanceSq < connectionDistanceSq) {
            connections.push({ particle: other, distanceSq, index: j });
          }
        }
        
        // 거리순으로 정렬 (제곱 거리로 정렬해도 순서는 동일)
        connections.sort((a, b) => a.distanceSq - b.distanceSq);
        
        // 최대 연결 수 제한 (성능 향상)
        const maxConnections = Math.min(4, Math.floor(2 + connectionIntensity * 2));
        
        for (let k = 0; k < Math.min(maxConnections, connections.length); k++) {
          const other = connections[k].particle;
          const connectionKey = `${Math.min(i, connections[k].index)}-${Math.max(i, connections[k].index)}`;
          
          if (drawnConnections.has(connectionKey)) continue;
          drawnConnections.add(connectionKey);
          
          // sqrt는 마지막에 한 번만 계산
          const distance = Math.sqrt(connections[k].distanceSq);
          const normalizedDistance = distance / connectionDistance;
          const baseOpacity = (1 - normalizedDistance) * 0.15;
          const opacity = Math.min(0.4, baseOpacity * connectionIntensity);
          
          ctx.strokeStyle = `rgba(30, 111, 255, ${opacity})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      // 원자 구조들 사이 연결선 그리기 (원 7개가 서로 연결됨)
      const atomConnectionIntensity = normalizedProgress < 0.5 
        ? 0.2 + (normalizedProgress / 0.5) * 0.5  // 모일수록 강해짐
        : 0.7 - ((normalizedProgress - 0.5) / 0.5) * 0.5;  // 퍼질수록 약해짐
      const atomCenters = atomsRef.current;
      
      for (let i = 0; i < atomCenters.length; i++) {
        for (let j = i + 1; j < atomCenters.length; j++) {
          const center1 = atomCenters[i];
          const center2 = atomCenters[j];
          
          // 원자 중심점들 사이 거리 계산
          const dx = center2.nucleusX - center1.nucleusX;
          const dy = center2.nucleusY - center1.nucleusY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 원자들 사이 연결선 그리기 (거리에 따라 투명도 조정)
          const maxAtomDistance = Math.min(width, height) * 0.6;
          const normalizedDistance = Math.min(1, distance / maxAtomDistance);
          const opacity = (1 - normalizedDistance * 0.5) * 0.3 * atomConnectionIntensity;
          
          ctx.strokeStyle = `rgba(30, 111, 255, ${opacity})`;
          ctx.lineWidth = 0.5; // 원자들 사이 연결선
          ctx.beginPath();
          ctx.moveTo(center1.nucleusX, center1.nucleusY);
          ctx.lineTo(center2.nucleusX, center2.nucleusY);
          ctx.stroke();
        }
      }

      // 파티클 그리기 (2D - 최적화: 레이어별로 그리기)
      const particlesByLayer: Particle[][] = [[], [], []];
      for (const particle of particles) {
        particlesByLayer[particle.layer].push(particle);
      }
      
      // 뒤 레이어부터 앞 레이어까지 그리기
      for (let layerIdx = 2; layerIdx >= 0; layerIdx--) {
        const layerParticles = particlesByLayer[layerIdx];
        
        layerParticles.forEach((particle) => {
          // 크기는 일정하게 유지
          const finalSize = particle.size;
          
          // 레이어 투명도
          const layerOpacity = [0.9, 0.7, 0.5][particle.layer];
          
          // 모일수록 투명도 증가
          let finalOpacity;
          if (normalizedProgress < 0.5) {
            // 모이는 단계
            const gatherProgress = normalizedProgress / 0.5;
            finalOpacity = (particle.opacity + gatherProgress * 0.3) * layerOpacity;
          } else {
            // 퍼지는 단계
            const spreadProgress = (normalizedProgress - 0.5) / 0.5;
            finalOpacity = (particle.opacity - spreadProgress * 0.3) * layerOpacity;
          }
          
          // 글로우 효과 (레이어에 따라)
          ctx.shadowBlur = (3 - particle.layer) * 4;
          ctx.shadowColor = primaryColor;
          
          // 간단한 그라디언트 (2D)
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            finalSize
          );
          
          const color = particle.layer === 0 ? primaryColor : secondaryColor;
          const alpha = Math.floor(finalOpacity * 255).toString(16).padStart(2, '0');
          const alphaMid = Math.floor(finalOpacity * 0.6 * 255).toString(16).padStart(2, '0');
          
          gradient.addColorStop(0, color + alpha);
          gradient.addColorStop(0.7, color + alphaMid);
          gradient.addColorStop(1, color + '00');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
        });
      }

      // 다음 프레임 요청 (무조건 호출 - 멈추지 않음)
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // 애니메이션 즉시 시작 (무조건 실행)
    console.log('Starting animation, particles:', particlesRef.current.length);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [width, height, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
